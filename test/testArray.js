define(['$',
        'expect',
        'atum/interpret'],
function($,
        expect,
        interpret){
    
    var a = $.Id('a'),
        b = $.Id('b'),
        c = $.Id('c'),
        length = $.Id('length'),
        keys = $.Member($.Id('Object'), $.Id('keys'));

    return {
        'module': "Array",
        'tests': [
            ["Simple Literal",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), $.Number(1), $.Number(2))))))
                    .test($.Expression($.Member(a, length)))
                        .type('number', 3)
                    .test($.Expression($.ComputedMember(a, $.Number(0))))
                        .type('number', 0)
                    .test($.Expression($.ComputedMember(a, $.Number(2))))
                        .type('number', 2)
                    .test($.Expression($.ComputedMember(a, $.Number(3))))
                        .type('undefined')
                    .test($.Expression($.ComputedMember(a, $.Number(-1))))
                        .type('undefined');
            }],
            ["Literal with empty elements",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), null, $.Number(1), null, $.Number(2)))),
                         $.Expression($.Assign(b, $.Call(keys, [a])))))
                    .test($.Expression($.Member(a, length)))
                        .type('number', 5)
                    .test($.Expression($.ComputedMember(a, $.Number(0))))
                        .type('number', 0)
                    .test($.Expression($.ComputedMember(a, $.Number(1))))
                        .type('undefined')
                    .test($.Expression($.ComputedMember(a, $.Number(4))))
                        .type('number', 2)
                    .test($.Expression($.Member(b, length)))
                        .type('number', 3);
            }],
            ["Array add increases length",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), $.Number(1), $.Number(2)))),
                         $.Expression($.Assign($.ComputedMember(a, $.Number(3)),
                             $.Number(3)))))
                     
                    .test($.Expression($.Member(a, length)))
                        .type('number', 4)
                        
                    .test($.Expression($.ComputedMember(a, $.Number(3))))
                        .type('number', 3);
            }],
            ["Array add large offset set increases length but not keys",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), $.Number(1), $.Number(2)))),
                         $.Expression($.Assign($.ComputedMember(a, $.Number(10)),
                             $.Number(10))),
                         $.Expression($.Assign(b, $.Call(keys, [a])))))
                         
                    .test($.Expression($.Member(a, length)))
                        .type('number', 11)
                        
                    .test($.Expression($.ComputedMember(a, $.Number(6))))
                        .type('undefined')
                        
                    .test($.Expression($.ComputedMember(a, $.Number(10))))
                        .type('number', 10)
                        
                    .test($.Expression($.Member(b, length)))
                        .type('number', 4)
            }],
            
            ["Array set larger length",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), $.Number(1), $.Number(2)))),
                         $.Expression($.Assign($.Member(a, length),
                             $.Number(10)))))
                     
                    .test($.Expression($.Member(a, length)))
                        .type('number', 10)
            }],
            
            ["Array set smaller length deletes",
            function(){
                expect.run(
                    $.Program(
                        $.Expression($.Assign(a,
                             $.Array($.Number(0), $.Number(1), $.Number(2), $.Number(3)))),
                         $.Expression($.Assign($.Member(a, length),
                             $.Number(2)))))
                     
                     .testResult()
                         .type('number', 2)
                     
                    .test($.Expression($.Member(a, length)))
                        .type('number', 2)
                        
                    .test($.Expression($.ComputedMember(a, $.Number(0))))
                        .type('number', 0)
                        
                    .test($.Expression($.ComputedMember(a, $.Number(1))))
                        .type('number', 1)
                    
                    .test($.Expression($.ComputedMember(a, $.Number(2))))
                        .type('undefined', undefined)
                        
                    .test($.Expression($.ComputedMember(a, $.Number(3))))
                        .type('undefined', undefined)
            }],
        ]
    };
});
