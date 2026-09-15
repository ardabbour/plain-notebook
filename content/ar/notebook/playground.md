---
title: تجارب Markdown
navTitle: تجارب Markdown
translationKey: playground
description: أمثلة قابلة للتجربة مع مصدر كل مثال.
order: 21
---
أمثلة فعلية لإمكانيات Markdown. افتح «مصدر المثال» لرؤية النص الذي ينتج كل مثال، وجرّب المظهر الفاتح والداكن واتجاه القراءة.

للمعادلات والمخططات، انتقل إلى [التجارب التقنية](./technical-notes.md). لتعديل الأمثلة، افتح هذا الملف في محرر النصوص وشغّل `npm run dev`، ثم حدّث المتصفح.

## النص والروابط

**Bold**, *italic*, ***both***, ~~a revised thought~~, and `inline code`.

[The writing guide](./markdown.md), [a reference link][guide], and <https://example.com>.

[guide]: ./markdown.md

Escaped punctuation: \*literal asterisks\*. A literal price: \$20.

A deliberate line break comes next.  
This starts on the next line.

::::: details مصدر المثال
````markdown
**Bold**, *italic*, ***both***, ~~a revised thought~~, and `inline code`.

[The writing guide](./markdown.md), [a reference link][guide], and <https://example.com>.

[guide]: ./markdown.md

Escaped punctuation: \*literal asterisks\*. A literal price: \$20.

A deliberate line break comes next.  
This starts on the next line.
````
:::::

## مستويات العناوين

### A section within a section

#### A smaller heading

##### A fifth-level heading

###### A sixth-level heading

::::: details مصدر المثال
````markdown
### A section within a section

#### A smaller heading

##### A fifth-level heading

###### A sixth-level heading
````
:::::

## القوائم والمهام

1. Write the first idea.
2. Add some detail.
   - An observation
   - A question
     - A more specific question

- [x] Write a page
- [ ] Revise the page
  - [x] Check the title
  - [ ] Check the examples

::::: details مصدر المثال
````markdown
1. Write the first idea.
2. Add some detail.
   - An observation
   - A question
     - A more specific question

- [x] Write a page
- [ ] Revise the page
  - [x] Check the title
  - [ ] Check the examples
````
:::::

## الاقتباسات والفواصل

> A notebook leaves room for a thought to change.
>
> > A quotation can contain another quotation.

---

A new thought after a horizontal rule.

::::: details مصدر المثال
````markdown
> A notebook leaves room for a thought to change.
>
> > A quotation can contain another quotation.

---

A new thought after a horizontal rule.
````
:::::

## الجداول

| Feature | Alignment | Example |
| :--- | :---: | ---: |
| **Emphasis** | Center | 12 |
| `inline code` | Center | 123 |
| Escaped pipe: \| | Center | 1,234 |

::::: details مصدر المثال
````markdown
| Feature | Alignment | Example |
| :--- | :---: | ---: |
| **Emphasis** | Center | 12 |
| `inline code` | Center | 123 |
| Escaped pipe: \| | Center | 1,234 |
````
:::::

## الملاحظات والأقسام القابلة للتوسيع

::: note A note
A short aside with **emphasis** and a [link](./markdown.md).
:::

::: tip A useful habit
Give a diagram a caption that explains the point.
:::

::: warning A limitation
Task boxes show the state written in the file. They are not an interactive task manager.
:::

:::: details Open this section
Lists, code, and other Markdown work inside.

- First detail
- Second detail

::: note Nested note
Keep extra context near the thing it explains.
:::
::::

::::: details مصدر المثال
````markdown
::: note A note
A short aside with **emphasis** and a [link](./markdown.md).
:::

::: tip A useful habit
Give a diagram a caption that explains the point.
:::

::: warning A limitation
Task boxes show the state written in the file. They are not an interactive task manager.
:::

:::: details Open this section
Lists, code, and other Markdown work inside.

- First detail
- Second detail

::: note Nested note
Keep extra context near the thing it explains.
:::
::::
````
:::::

## الشيفرة والصور

~~~js
const total = [1, 2, 3].reduce((sum, value) => sum + value, 0);
console.log(total);
~~~

~~~python
def square(value):
    return value ** 2
~~~

~~~
Unknown or omitted languages are shown as plain text.
~~~

![The notebook’s open-book icon](/favicon.svg)

::::: details مصدر المثال
````markdown
~~~js
const total = [1, 2, 3].reduce((sum, value) => sum + value, 0);
console.log(total);
~~~

~~~python
def square(value):
    return value ** 2
~~~

~~~
Unknown or omitted languages are shown as plain text.
~~~

![The notebook’s open-book icon](/favicon.svg)
````
:::::

## الحواشي

A thought with a footnote[^context]. The same note can be referenced again[^context].

[^context]: A little more context, with **formatting** and an [ordinary link](./markdown.md).

::::: details مصدر المثال
````markdown
A thought with a footnote[^context]. The same note can be referenced again[^context].

[^context]: A little more context, with **formatting** and an [ordinary link](./markdown.md).
````
:::::

## مزج اللغات

هذه فقرة عربية تحتوي على **نص عريض** وشيفرة مثل `const count = 3;`.

English text can sit beside العربية. Switch the language menu to inspect the whole layout from right to left.

::::: details مصدر المثال
````markdown
هذه فقرة عربية تحتوي على **نص عريض** وشيفرة مثل `const count = 3;`.

English text can sit beside العربية. Switch the language menu to inspect the whole layout from right to left.
````
:::::

## حدود الدعم

العناوين والروابط والصور والقوائم والجداول والحواشي والشيفرة والملاحظات مدعومة، وكذلك المعادلات والمخططات في صفحة التجارب التقنية.

الصيغ التالية ليست مفعّلة: `==تمييز==`، `H~2~O`، `x^2^` خارج المعادلات، وقوائم التعريفات. تظهر كنص عادي. كما أن تضمين الفيديو وHTML وMDX والمكونات البرمجية غير مفعّل.

```html
<button>يظهر HTML كنص ولا يتحول إلى زر</button>
```

