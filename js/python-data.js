/* ============================================================
 * Python悟道洞府 —— 术法（知识点）数据
 * 每个知识点：标题、简介、视频来源链接、术法避坑指南
 * 视频链接为公开教学平台检索入口，便于替换为正式课程链接
 * ============================================================ */
(function (global) {
  'use strict';

  const PY_NODES = [
    {
      id: 'p1', title: '变量与数据类型', level: '入门',
      desc: '认识数字、字符串、布尔与 None，掌握变量的命名与赋值之道。',
      video: 'https://www.bilibili.com/search?keyword=Python%E5%8F%98%E9%87%8F%E4%B8%8E%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B',
      pitfalls: [
        '变量名不可用数字开头，且区分大小写（Name 与 name 是两个变量）。',
        '字符串用单引号或双引号皆可，但同一字符串需成对；混用易报语法错。',
        '整数与字符串不能直接相加，需用 str() 或 f-string 转换。'
      ]
    },
    {
      id: 'p2', title: '运算符与表达式', level: '入门',
      desc: '算术、比较、逻辑运算符，理解表达式的求值顺序。',
      video: 'https://www.bilibili.com/search?keyword=Python%E8%BF%90%E7%AE%97%E7%AC%A6',
      pitfalls: [
        '== 是比较值，= 是赋值，初学者常把 if x = 1 写成赋值而报错。',
        'and / or 返回的是操作数之一，而非固定 True/False。',
        '除法 / 永远得到浮点数，整除请用 //，否则类型不符易踩坑。'
      ]
    },
    {
      id: 'p3', title: '条件判断 if', level: '入门',
      desc: '用 if / elif / else 控制程序走向，写出会思考的代码。',
      video: 'https://www.bilibili.com/search?keyword=Python%20if%20%E6%9D%A1%E4%BB%B6%E5%88%A4%E6%96%AD',
      pitfalls: [
        'Python 以缩进区分代码块，缩进不一致会触发 IndentationError。',
        '多条件判断用 elif，不要写成多个独立的 if 导致逻辑重复执行。',
        '不要遗漏冒号 :，否则语法报错。'
      ]
    },
    {
      id: 'p4', title: '循环 for 与 while', level: '入门',
      desc: '遍历序列与重复执行，掌握 range、break、continue。',
      video: 'https://www.bilibili.com/search?keyword=Python%20for%20while%20%E5%BE%AA%E7%8E%AF',
      pitfalls: [
        'while 循环务必有改变条件的语句，否则陷入死循环。',
        'for 遍历列表时不要在循环内直接删除元素，易导致漏项；用倒序或新列表。',
        'range(5) 生成 0~4，不是 1~5，差一错误最常见。'
      ]
    },
    {
      id: 'p5', title: '列表与元组', level: '基础',
      desc: '有序容器：增删改查、切片、列表推导式。',
      video: 'https://www.bilibili.com/search?keyword=Python%20list%20%E5%88%97%E8%A1%A8',
      pitfalls: [
        '列表可变、元组不可变，需修改时用列表；误改元组会报 TypeError。',
        '切片 list[1:4] 含头不含尾，取到索引 3。',
        'list.copy() 才是浅拷贝，直接赋值 b=a 只是多了一个引用。'
      ]
    },
    {
      id: 'p6', title: '字典与集合', level: '基础',
      desc: '键值映射与去重集合，理解哈希与查找效率。',
      video: 'https://www.bilibili.com/search?keyword=Python%20dict%20%E5%AD%97%E5%85%B8',
      pitfalls: [
        '字典通过 key 取值，key 不存在会 KeyError；可用 get() 设默认值。',
        '集合元素必须可哈希，列表等可变类型不能放入集合。',
        '遍历字典时修改大小会报错，先收集 key 再操作。'
      ]
    },
    {
      id: 'p7', title: '函数定义与调用', level: '基础',
      desc: '用 def 封装逻辑，理解参数、返回值与作用域。',
      video: 'https://www.bilibili.com/search?keyword=Python%20%E5%87%BD%E6%95%B0%20def',
      pitfalls: [
        '默认参数不要用可变对象（如 list=[]），会被多次调用共享；用 None 代替。',
        '函数内修改全局变量需 global 声明，否则只是新建局部变量。',
        '返回值用 return，漏写则默认返回 None。'
      ]
    },
    {
      id: 'p8', title: '字符串处理', level: '基础',
      desc: '切片、格式化（f-string）、常用方法。',
      video: 'https://www.bilibili.com/search?keyword=Python%20%E5%AD%97%E7%AC%A6%E4%B8%B2%20f-string',
      pitfalls: [
        '字符串不可变，replace 之类方法返回新串，原串不变。',
        'f-string 用 f"{x}"，字符串里的大括号需双写转义。',
        'split 默认按空白分割，指定分隔符才不会得到意外结果。'
      ]
    },
    {
      id: 'p9', title: '文件读写', level: '进阶',
      desc: '用 open 与 with 读写文本/CSV，理解上下文管理。',
      video: 'https://www.bilibili.com/search?keyword=Python%20%E6%96%87%E4%BB%B6%E8%AF%BB%E5%86%99',
      pitfalls: [
        '忘记关闭文件会丢数据；优先用 with 自动关闭。',
        '读写模式 "r"/"w"/"a" 要分清，w 会清空原内容。',
        '中文文件建议指定 encoding="utf-8"，否则乱码。'
      ]
    },
    {
      id: 'p10', title: '异常处理 try/except', level: '进阶',
      desc: '捕获并处理错误，让程序稳健不崩。',
      video: 'https://www.bilibili.com/search?keyword=Python%20try%20except%20%E5%BC%82%E5%B8%B8',
      pitfalls: [
        '不要用裸 except: 吞掉所有错误，至少捕获具体异常。',
        'finally 一定执行，适合释放资源。',
        'raise 可主动抛错，便于上层处理。'
      ]
    },
    {
      id: 'p11', title: '类与对象', level: '进阶',
      desc: '面向对象：属性、方法、self 与 __init__。',
      video: 'https://www.bilibili.com/search?keyword=Python%20class%20%E7%B1%BB%20%E5%AF%B9%E8%B1%A1',
      pitfalls: [
        '实例方法第一个参数必须是 self，调用时自动传入。',
        '__init__ 是初始化而非构造，用来设置初始属性。',
        '类名用大驼峰，方法名用小写蛇形，符合 PEP8。'
      ]
    },
    {
      id: 'p12', title: '模块与包', level: '进阶',
      desc: '拆分代码、import 复用，理解标准库与第三方库。',
      video: 'https://www.bilibili.com/search?keyword=Python%20import%20%E6%A8%A1%E5%9D%97',
      pitfalls: [
        '避免循环导入，把公共定义放到独立模块。',
        'from x import * 会污染命名空间，建议显式导入。',
        '第三方库需先 pip install 才能 import。'
      ]
    },
    {
      id: 'p13', title: '列表推导与生成器', level: '提高',
      desc: '用简洁语法生成序列，理解惰性求值。',
      video: 'https://www.bilibili.com/search?keyword=Python%20%E5%88%97%E8%A1%A8%E6%8E%A8%E5%AF%BC%E5%BC%8F',
      pitfalls: [
        '推导式嵌套过深会降低可读性，复杂逻辑改用普通循环。',
        '生成器用 ()，只能遍历一次，再次遍历为空。',
        '大数据用生成器省内存，别硬生成大列表。'
      ]
    },
    {
      id: 'p14', title: '装饰器', level: '提高',
      desc: '在不改原函数前提下扩展功能，理解闭包。',
      video: 'https://www.bilibili.com/search?keyword=Python%20%E8%A3%85%E9%A5%B0%E5%99%A8',
      pitfalls: [
        '装饰器本质是函数返回函数，需理解闭包变量。',
        '用 functools.wraps 保留原函数元信息。',
        '带参数装饰器需多包一层，结构易写错。'
      ]
    }
  ];

  global.XPythonData = { PY_NODES };
})(window);
