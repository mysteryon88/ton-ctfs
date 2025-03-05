def pow25(x):
    return x**25

constant = 1968172103452999492963878188028555943794336458502883276710491621054698698752

min_val = -1300
max_val = 1300

# The enumeration over a, b, c. d is calculated as 2 - (a+b+c)
for a in range(min_val, max_val + 1):
    for b in range(min_val, max_val + 1):
        for c in range(min_val, max_val + 1):
            d = 2 - (a + b + c)
            if d < min_val or d > max_val:
                continue
            if pow25(a) + pow25(b) + pow25(c) + pow25(d) == constant:
                print(f"a = {a}, b = {b}, c = {c}, d = {d}")