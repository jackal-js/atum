define(['$',
        'expect',
        'atum/interpret'],
function($,
        expect,
        interpret){
    
    var a = $.Id('a');
    var b = $.Id('b');
    var c = $.Id('c');

    return {
        'module': "Function Tests",
        'tests': [
            ["Empty Func Declaration",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [],
                        $.Block()),
                    $.Call(a, []));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'undefined');
                assert.equal(result.value, undefined);
            }],
            ["Constant Func Declaration",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [],
                        $.Block(
                            $.Return($.Number(3)))),
                    $.Expression($.Call(a, [])));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 3);
            }],
            ["Id Func Declaration",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                            $.Return(b))),
                    $.Call(a, [
                      $.Number(3)]));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 3);
            }],
            ["Multiple Argument Func Declaration",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b, c],
                        $.Block(
                            $.Return($.Add(b, c)))),
                    $.Call(a, [
                      $.Number(1),
                      $.Number(3)]));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 4);
            }],
            ["Undefined Argument",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                            $.Return(b))),
                    $.Call(a, []));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'undefined');
                assert.equal(result.value, undefined);
            }],
            ["Argument Scope Leak Check",
            function(){
                // Make sure bound arguments are not accessible in calling scope.
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block()),
                    $.Call(a, [$.Number(1)]),
                    $.Expression(b));
                
                assert.throws(interpret.evaluate.bind(undefined, root));
            }],
            
            ["Argument Alias Scope Check",
            function(){
                // Make sure closest bound value for argument is used.
                var root = $.Program(
                    $.Expression(
                        $.Assign(b, $.Number(100))),
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                          $.Return(b))),
                    $.Call(a, [$.Number(1)]));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            ["Dynamic Resolution In Scope Check",
            function(){
                // Check that variables in function scope are resolved to current
                // values, not values when function declared.
                var root = $.Program(
                    $.Var(
                         $.Declarator(b)),
                    $.FunctionDeclaration(a, [],
                        $.Block(
                          $.Return(b))),
                    $.Expression(
                        $.Assign(b, $.Number(1))),
                    $.Add(
                        // b resolves to 1
                        $.Call(a, []), 
                        // b resolves to 3
                        $.Call(a, [
                               $.Assign(b, $.Number(3))])));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 4);
            }],
            
            ["Closure Argument Check",
            function(){
                // Checks that argument passed in can be used in returned function.
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                          $.Return(
                              $.FunctionExpression(null, [],
                                  $.Block(
                                      $.Return(b)))))),
                    $.Call(
                        $.Call(a, [$.Number(1)]),
                        []));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            ["Closure Variable Check",
            function(){
                // Checks that variable defines in function scope is accessible in closure.
                var root = $.Program(
                    $.FunctionDeclaration(a, [],
                        $.Block(
                            $.Var(
                                $.Declarator(b, $.Number(1))),
                          $.Return(
                              $.FunctionExpression(null, [],
                                  $.Block(
                                      $.Return(b)))))),
                    $.Call(
                        $.Call(a, []),
                        []));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            
            ["External Assignment Check",
            function(){
                // Checks that variable assignment for external scope modifies
                // that variable.
                var root = $.Program(
                    $.Expression(
                        $.Assign(b, $.Number(0))),
                    $.FunctionDeclaration(a, [],
                        $.Block(
                           $.Assign(b, $.Number(10)))),
                        $.Call(a, []),
                        $.Expression(b));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 10);
            }],
            
             
            ["Values passed by value",
            function(){
                // Checks that arguments primitive values are passed by value
                var root = $.Program(
                    $.FunctionDeclaration(
                        a,
                        [b],
                        $.Block(
                           $.Assign(b, $.Number(10)))),
                    $.Expression(
                        $.Assign(b, $.Number(2))),
                    $.Call(a, [b]),
                    $.Expression(b));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 2);
            }],
            
            ["Objects passed by reference",
            function(){
                // Checks that argument object values are passed by reference
                // but that environment binding still acts correctly.
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                           $.Expression($.Assign($.Member(b, c), $.Number(10))),
                           $.Expression($.Assign(b, $.Number(1))))),
                    $.Expression($.Assign(b, $.Object({
                         'kind': 'init',
                         'key': $.String('c'),
                         'value': $.Number(1)
                     }))),
                    $.Expression($.Call(a, [b])),
                    $.Expression($.Member(b, c)));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 10);
            }],
            
            ["Call With global this",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                           $.Expression($.Assign($.Member($.This(), c), b)),
                           $.Return($.Number(1)))),
                    $.Expression($.Call(a, [$.Number(10)])),
                    $.Expression($.Member($.This(), c)));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 10);
            }],
            ["Set Property on function object",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [],
                        $.Block(
                           $.Return($.Number(1)))),
                    $.Expression($.Assign($.Member(a, c), $.Number(10))),
                    $.Expression($.Add($.Call(a, []), $.Member(a, c))));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 11);
            }],
            ["Set on current function object in function",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                           $.Expression($.Assign($.Member(a, c), b)),
                           $.Return($.Number(b)))),
                    $.Expression($.Call(a, [$.Number(11)])),
                    $.Expression($.Member(a, c)));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 11);
            }],
            ["Throw in function",
            function(){
                expect.run(
                    $.Program(
                        $.FunctionDeclaration(a, [b],
                            $.Block(
                               $.Throw(b))),
                        $.Try(
                            $.Expression($.Call(a, [$.Number(11)])),
                        $.Catch(c,
                            $.Expression(c)))))
                        
                    .testResult()
                        .type('number', 11);
            }],
            ["Error in function",
            function(){
                expect.run(
                    $.Program(
                        $.FunctionDeclaration(a, [],
                            $.Block(
                               $.Return(b))),
                        $.Try(
                            $.Expression($.Call(a, [])),
                        $.Catch(c,
                            $.Expression($.Number(13))))))
                        
                    .testResult()
                        .type('number', 13);
            }],
            ["Func Declaration Recursive Call",
            function(){
                var root = $.Program(
                    $.FunctionDeclaration(a, [b],
                        $.Block(
                            $.If($.Gt(b, $.Number(1)),
                                $.Return($.Call(a, [$.Sub(b, $.Number(1))]))),
                            $.Return(b))),
                    $.Expression($.Call(a, [$.Number(5)])));
                
                var result = interpret.evaluate(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            ["Delete Func Declaration",
            function(){
                expect.run(
                    $.Program(
                        $.FunctionDeclaration(a, [],
                            $.Block(
                                $.Return($.Number(13)))),
                        $.Expression($.Assign(b, $.Call(a, []))),
                        $.Expression($.Assign(c, $.Delete(a))),
                        $.Expression($.Call(a, []))))
                    
                    .isError()
                    
                    .test($.Expression(b))
                        .type('number', 13)
                    
                    .test($.Expression(c))
                        .type('boolean', true);
            }],
            
            /* This test takes to long to be regularly included
            ["Max Stack",
            function(){
                expect.run(
                    $.Program(
                        $.FunctionDeclaration(a, [b],
                            $.Block(
                               $.If($.Gt(b, $.Number(0)),
                                   $.Return($.Call(a, [$.Sub(b, $.Number(1))])),
                                   $.Return(b)))),
                        $.Expression($.Call(a, [$.Number(1001)]))))
                    .isError();
            }],*/
            
        ]
    };
});
