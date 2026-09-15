---
title: Technical experiments
navTitle: Math and diagrams
translationKey: technical-notes
description: Equations and diagrams, written in plain text.
order: 22
---
Equations and diagrams rendered when the site builds. They work without browser JavaScript. Open the source beneath an example and try changing it in this Markdown file.

[Back to the Markdown playground](./playground.md). Equations use TeX notation; diagrams use a supported subset of Mermaid. Try dark mode and Arabic to see how the same content behaves.

## Inline and display math

A circle has area $A = \pi r^2$. A vector can be written $\mathbf{v} = (v_1, v_2)$.

$$
e^{i\pi} + 1 = 0
$$

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

::::: details Example source
````markdown
A circle has area $A = \pi r^2$. A vector can be written $\mathbf{v} = (v_1, v_2)$.

$$
e^{i\pi} + 1 = 0
$$

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
````
:::::

## Sums, integrals, and probability

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

$$
P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}
$$

::::: details Example source
````markdown
$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

$$
P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}
$$
````
:::::

## Matrices, cases, and aligned equations

$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix} x \\ y \end{bmatrix}
=
\begin{bmatrix} x + 2y \\ 3x + 4y \end{bmatrix}
$$

$$
f(x) =
\begin{cases}
x^2 & x \geq 0 \\
-x & x < 0
\end{cases}
$$

$$
\begin{aligned}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{aligned}
$$

::::: details Example source
````markdown
$$
\begin{bmatrix}
1 & 2 \\
3 & 4
\end{bmatrix}
\begin{bmatrix} x \\ y \end{bmatrix}
=
\begin{bmatrix} x + 2y \\ 3x + 4y \end{bmatrix}
$$

$$
f(x) =
\begin{cases}
x^2 & x \geq 0 \\
-x & x < 0
\end{cases}
$$

$$
\begin{aligned}
(a+b)^2 &= a^2 + 2ab + b^2 \\
(a-b)^2 &= a^2 - 2ab + b^2
\end{aligned}
$$
````
:::::

## Math in context

| Quantity | Formula |
| --- | --- |
| Mean | $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$ |
| Standard deviation | $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2}$ |

::: note Inside a callout
The identity $\sin^2\theta+\cos^2\theta=1$ still reads like part of the sentence.
:::

هذه جملة عربية تتضمن المعادلة $E = mc^2$ ثم تتابع الفكرة.

~~~math
\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n = e
~~~

::::: details Example source
````markdown
| Quantity | Formula |
| --- | --- |
| Mean | $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$ |
| Standard deviation | $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2}$ |

::: note Inside a callout
The identity $\sin^2\theta+\cos^2\theta=1$ still reads like part of the sentence.
:::

هذه جملة عربية تتضمن المعادلة $E = mc^2$ ثم تتابع الفكرة.

~~~math
\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n = e
~~~
````
:::::

## Flowcharts

~~~mermaid From a draft to a published page
flowchart TD
    A[Write a note] --> B{Ready to share?}
    B -->|Yes| C[Build the site]
    B -->|Not yet| D[Keep as draft]
    C --> E[Publish HTML]
    D --> A
~~~

~~~mermaid مسار الفكرة من اليمين إلى اليسار
flowchart RL
    A[فكرة] --> B[مسودة]
    B --> C[مراجعة]
    C --> D[نشر]
~~~


## Sequence diagrams

~~~mermaid The reader requests a static page
sequenceDiagram
    participant Reader
    participant Host
    Reader->>Host: Request a page
    Host-->>Reader: HTML and CSS
    Reader->>Host: Search the notebook
    Host-->>Reader: Search index
~~~


## State diagrams

~~~mermaid A note moves through three states
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: ready
    Review --> Draft: revise
    Review --> Published: approve
    Published --> [*]
~~~


## Classes and relationships

~~~mermaid A notebook contains pages
classDiagram
    Notebook "1" --> "*" Page : contains
    Notebook : +String title
    Page : +String title
    Page : +String content
    Page : +publish()
~~~

~~~mermaid Authors write notes
erDiagram
    AUTHOR ||--o{ NOTE : writes
    AUTHOR {
        string name
    }
    NOTE {
        string title
        string language
    }
~~~


## What is supported?

- Inline `$...$` and display `$$` math, plus fenced `math` blocks.
- The TeX commands supported by KaTeX, rendered as native browser MathML.
- Flowcharts, sequence diagrams, state diagrams, class diagrams, and entity relationships, rendered as SVG.
- Arabic node labels; use `RL` for a flowchart that runs right to left.

This is a subset of Mermaid. Pie charts, Gantt charts, interactive diagrams, custom styling, and initialization directives are not enabled. Some advanced Mermaid syntax may be ignored by the renderer; inspect the result as you experiment. Detected math or diagram errors stop the build and identify the file.

Equations stay left to right. Wide equations and diagrams scroll within the page. Add a nearby prose explanation for complex diagrams. There is no in-browser editor: edit the Markdown file and refresh to see the result.

