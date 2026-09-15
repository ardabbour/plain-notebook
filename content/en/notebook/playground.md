---
title: Markdown playground
navTitle: Markdown playground
translationKey: playground
description: An example of each element, with the source beneath it.
order: 21
---
Real examples of the Markdown we can use. Open **Example source** to see how each one is written. Try the theme and language controls while you browse.

For equations and diagrams, open [Technical experiments](./technical-notes.md). To change these examples, edit this Markdown file with `npm run dev` running, then refresh the browser.

## Text and links

**Bold**, *italic*, ***both***, ~~a revised thought~~, and `inline code`.

[The writing guide](./markdown.md), [a reference link][guide], and <https://example.com>.

[guide]: ./markdown.md

Escaped punctuation: \*literal asterisks\*. A literal price: \$20.

A deliberate line break comes next.  
This starts on the next line.

::::: details Example source
````markdown
**Bold**, *italic*, ***both***, ~~a revised thought~~, and `inline code`.

[The writing guide](./markdown.md), [a reference link][guide], and <https://example.com>.

[guide]: ./markdown.md

Escaped punctuation: \*literal asterisks\*. A literal price: \$20.

A deliberate line break comes next.  
This starts on the next line.
````
:::::

## Heading levels

### A section within a section

#### A smaller heading

##### A fifth-level heading

###### A sixth-level heading

::::: details Example source
````markdown
### A section within a section

#### A smaller heading

##### A fifth-level heading

###### A sixth-level heading
````
:::::

## Lists and tasks

1. Write the first idea.
2. Add some detail.
   - An observation
   - A question
     - A more specific question

- [x] Write a page
- [ ] Revise the page
  - [x] Check the title
  - [ ] Check the examples

::::: details Example source
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

## Quotations and dividers

> A notebook leaves room for a thought to change.
>
> > A quotation can contain another quotation.

---

A new thought after a horizontal rule.

::::: details Example source
````markdown
> A notebook leaves room for a thought to change.
>
> > A quotation can contain another quotation.

---

A new thought after a horizontal rule.
````
:::::

## Tables

| Feature | Alignment | Example |
| :--- | :---: | ---: |
| **Emphasis** | Center | 12 |
| `inline code` | Center | 123 |
| Escaped pipe: \| | Center | 1,234 |

::::: details Example source
````markdown
| Feature | Alignment | Example |
| :--- | :---: | ---: |
| **Emphasis** | Center | 12 |
| `inline code` | Center | 123 |
| Escaped pipe: \| | Center | 1,234 |
````
:::::

## Callouts and details

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

::::: details Example source
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

## Code and images

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

::::: details Example source
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

## Footnotes

A thought with a footnote[^context]. The same note can be referenced again[^context].

[^context]: A little more context, with **formatting** and an [ordinary link](./markdown.md).

::::: details Example source
````markdown
A thought with a footnote[^context]. The same note can be referenced again[^context].

[^context]: A little more context, with **formatting** and an [ordinary link](./markdown.md).
````
:::::

## Mixed languages

هذه فقرة عربية تحتوي على **نص عريض** وشيفرة مثل `const count = 3;`.

English text can sit beside العربية. Switch the language menu to inspect the whole layout from right to left.

::::: details Example source
````markdown
هذه فقرة عربية تحتوي على **نص عريض** وشيفرة مثل `const count = 3;`.

English text can sit beside العربية. Switch the language menu to inspect the whole layout from right to left.
````
:::::

## Support boundaries

Headings, links, images, lists, tables, footnotes, code, callouts, and details work now, along with the equations and diagrams on the technical experiments page.

These extensions are not enabled: `==highlight==`, `H~2~O`, `x^2^` outside math, and definition lists. They remain ordinary text. Video embeds, raw HTML, MDX, and executable components are not enabled.

```html
<button>Raw HTML displays as text, not a button.</button>
```

