# 与DOM 操作

## 1.nodeType/nodeName/nodeValue

| **节点类型**          | **nodeName 返回** | nodeType返回 | **nodeValue 返回** |
| --------------------- | ----------------- | ------------ | ------------------ |
| Element               | 元素名            | 1            | null               |
| Attr                  | 属性名称          | 2            | 属性值             |
| Text                  | #text             | 3            | 节点的内容         |
| CDATASection          | #cdata-section    | 4            | 节点的内容         |
| EntityReference       | 实体引用名称      | 5            | null               |
| Entity                | 实体名称          | 6            | null               |
| ProcessingInstruction | target            | 7            | 节点的内容         |
| Document              | #document         | 8            | null               |
| DocumentType          | 文档类型名称      | 9            | null               |
| DocumentFragment      | #document 片段    | 10           | null               |
| Notation              | 符号名称          | 11           | null               |

```js
//判断元素
DOM.nodeType
DOM.nodeName
DOM.nodeValue
```
## 2.childNodes
```js
// 获取子节点 返回数组
[
    0: text
    1: div#hello1.div1.div1-1
    2: text
    3: div#hello2
    4: text
    5: div#hello3
    6: text
    7: ul
    8: text
]
DOM.childNodes
```
## 事件队列

## [任务调度](https://blog.csdn.net/brokenkay/article/details/104852296)

## 队列算法

##  深度优先 和 广度优先

## 运行机制