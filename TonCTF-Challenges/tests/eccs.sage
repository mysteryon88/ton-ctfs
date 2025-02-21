# I solved it here
# https://cocalc.com/

p = 738077334260605249
E = EllipticCurve(GF(p), [1, 3])

G = E(627636259244800403, 317346088871876181)
P = E(456557409365020317, 354112687690635257)
print(G.discrete_log(P))