define(['ecma/ast/value',
        'ecma/ast/program',
        'ecma/ast/declaration',
        'ecma/ast/expression',
        'ecma/ast/statement',
        'atum/interpret'],
function(value,
        program,
        declaration,
        expression,
        statement,
        interpret){
    
    var a = new value.Identifier(null, 'a');
    
    return {
        'module': "Test Increment and Decrement Operators",
        'tests': [
        // Prefix Increment 
            ["Prefix Increment Changes Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('++', a, true)),
                    new statement.ExpressionStatement(a)]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            ["Prefix Increment Return Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('++', a, true))]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            
        // Prefix Decrement 
            ["Prefix Decrement Changes Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('--', a, true)),
                    new statement.ExpressionStatement(a)]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, -1);
            }],
            ["Prefix Decrement Return Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('--', a, true))]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, -1);
            }],
            
         // Postfix Increment 
            ["Postfix Increment Changes Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('++', a, false)),
                    new statement.ExpressionStatement(a)]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 1);
            }],
            ["Postfix Increment Return Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('++', a, false))]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 0);
            }],
            
        // Postfix Decrement 
            ["Postfix Increment Changes Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('--', a, false)),
                    new statement.ExpressionStatement(a)]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, -1);
            }],
            ["Postfix Increment Return Value",
            function(){
                var root = new program.Program([
                    new declaration.VariableDeclaration([
                         new declaration.VariableDeclarator(
                             a,
                             new value.Literal(null, 0, "number"))]),
                    new statement.ExpressionStatement(
                        new expression.UpdateExpression('--', a, false))]);
                
                var result = interpret.interpret(root);
                assert.equal(result.type, 'number');
                assert.equal(result.value, 0);
            }],
            
        ],
    };
});
