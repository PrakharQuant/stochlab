# Research & Validation

This directory is reserved for independent Python validation notebooks.

## Suggested workflow

```python
import numpy as np
from scipy.stats import norm

# Independent Vasicek exact transition check
# Independent Heston CF pricing check against known benchmarks
```

See the TypeScript unit tests in `src/tests/` for the primary automated validation suite.
