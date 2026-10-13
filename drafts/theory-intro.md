Every interactive program faces the same problem. It has to act on values it does not control, and those values arrive on the world's schedule rather than the program's.

There is no general theory of this problem. There are many partial theories, each developed for one kind of product, and building real software means stitching them together. A great deal of the effort of building software goes into those seams.

What if one model covered almost all interactive software? A program would be described once, and the features that are now built as separate services would follow from the description.

That has become possible within the last fifteen years. Work on conflict-free replicated data types (CRDTs) showed that people can change the same data on separate devices and merge their work without anyone ordering the changes first. With the CALM theorem, there is now an exact line between the computations that can run this way and the ones that must wait for agreement.

The theory in this post builds on those results. If it is right, interactive software stops being a collection of special cases and becomes one subject. The theory is small: four primitives, and eight principles grounded in constraints that are true of all interactive software.
