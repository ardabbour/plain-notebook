---
title: التجارب التقنية
navTitle: معادلات ومخططات
translationKey: technical-notes
description: معادلات ومخططات من نص بسيط.
order: 22
---
معادلات ومخططات تُرسم أثناء بناء الموقع وتعمل دون JavaScript في المتصفح. افتح مصدر كل مثال لتجربته.

[العودة إلى تجارب Markdown](./playground.md). المعادلات تستخدم صيغة TeX والمخططات تستخدم مجموعة من صياغة Mermaid. جرّب تغيير المظهر واللغة لترى النتيجة.

## المعادلات ضمن النص والمنفصلة

مساحة الدائرة هي $A = \pi r^2$. ويمكن كتابة المتجه على الصورة $\mathbf{v} = (v_1, v_2)$.

$$
e^{i\pi} + 1 = 0
$$

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

::::: details مصدر المثال
````markdown
مساحة الدائرة هي $A = \pi r^2$. ويمكن كتابة المتجه على الصورة $\mathbf{v} = (v_1, v_2)$.

$$
e^{i\pi} + 1 = 0
$$

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$
````
:::::

## المجاميع والتكاملات والاحتمالات

$$
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
$$

$$
\int_0^1 x^2\,dx = \frac{1}{3}
$$

$$
P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}
$$

::::: details مصدر المثال
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

## المصفوفات والحالات والمعادلات المتراصفة

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

::::: details مصدر المثال
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

## المعادلات في سياقها

| الكمية | الصيغة |
| --- | --- |
| المتوسط | $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$ |
| الانحراف المعياري | $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2}$ |

::: note داخل ملاحظة
تبقى المتطابقة $\sin^2\theta+\cos^2\theta=1$ جزءًا من الجملة.
:::

هذه جملة عربية تتضمن المعادلة $E = mc^2$ ثم تتابع الفكرة.

~~~math
\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n = e
~~~

::::: details مصدر المثال
````markdown
| الكمية | الصيغة |
| --- | --- |
| المتوسط | $\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i$ |
| الانحراف المعياري | $\sigma = \sqrt{\frac{1}{N}\sum_{i=1}^{N}(x_i-\mu)^2}$ |

::: note داخل ملاحظة
تبقى المتطابقة $\sin^2\theta+\cos^2\theta=1$ جزءًا من الجملة.
:::

هذه جملة عربية تتضمن المعادلة $E = mc^2$ ثم تتابع الفكرة.

~~~math
\lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n = e
~~~
````
:::::

## المخططات الانسيابية

~~~mermaid من المسودة إلى الصفحة المنشورة
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


## المخططات التسلسلية

~~~mermaid يطلب القارئ صفحة ثابتة
sequenceDiagram
    participant Reader
    participant Host
    Reader->>Host: Request a page
    Host-->>Reader: HTML and CSS
    Reader->>Host: Search the notebook
    Host-->>Reader: Search index
~~~


## مخططات الحالات

~~~mermaid تنتقل الملاحظة بين ثلاث حالات
stateDiagram-v2
    [*] --> Draft
    Draft --> Review: ready
    Review --> Draft: revise
    Review --> Published: approve
    Published --> [*]
~~~


## الفئات والعلاقات

~~~mermaid يحتوي الدفتر على صفحات
classDiagram
    Notebook "1" --> "*" Page : contains
    Notebook : +String title
    Page : +String title
    Page : +String content
    Page : +publish()
~~~

~~~mermaid يكتب المؤلفون الملاحظات
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


## ما الذي ندعمه؟

- معادلات ضمن النص بين `$...$` ومعادلات منفصلة بين `$$`، أو داخل كتلة `math`.
- صياغة TeX التي يدعمها KaTeX، وتتحول إلى MathML أصلي في المتصفح.
- مخططات انسيابية وتسلسلية وحالات وفئات وعلاقات كيانات، وتتحول إلى SVG.
- أسماء عربية في العقد؛ استخدم `RL` لمخطط من اليمين إلى اليسار.

هذه مجموعة من Mermaid وليست جميع إمكانياته. المخططات الدائرية وGantt والمخططات التفاعلية وتخصيص الأنماط غير مفعّلة. بعض صيغ Mermaid المتقدمة قد لا تُفسّر؛ تحقّق من النتيجة بصريًا عند التجربة. الخطأ الذي يكتشفه المحلل يوقف البناء ويعرض اسم الملف.

تبقى المعادلات من اليسار إلى اليمين. المخططات والمعادلات العريضة قابلة للتمرير. أضف وصفًا نصيًا قريبًا من المخططات المعقدة. لا يوجد محرر داخل المتصفح: عدّل ملف Markdown ثم حدّث الصفحة.

