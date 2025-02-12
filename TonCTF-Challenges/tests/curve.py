#!/usr/bin/env python3
"""
This script exploits the vulnerability in the custom elliptic curve implementation.
Due to the linear structure (after a shift by zero.x), the point addition becomes linear.
Thus, for a given point P and its scalar multiplication k*P = Q, the relation holds:

    f(Q) = k * f(P)   (mod p)

where f(P) = P.x - zero.x.

We are given:
    - p: the modulus
    - p1.x: the x-coordinate of the point P
    - p2.x: the x-coordinate of the point Q
    - zero.x: the shift value used in the contract

The scalar k is computed by:
    k = (p2.x - zero.x) * invMod(p1.x - zero.x, p) (mod p)
"""

def modinv(a, m):
    """
    Compute the modular inverse of a modulo m using the Extended Euclidean Algorithm.
    That is, find x such that (a * x) % m == 1.
    
    :param a: The number for which the modular inverse is to be found.
    :param m: The modulus.
    :return: The modular inverse of a modulo m.
    :raises Exception: If the modular inverse does not exist.
    """
    # Extended Euclidean Algorithm
    def egcd(a, b):
        if a == 0:
            return b, 0, 1
        else:
            gcd, x, y = egcd(b % a, a)
            return gcd, y - (b // a) * x, x

    gcd, x, _ = egcd(a, m)
    if gcd != 1:
        raise Exception("Modular inverse does not exist for a = {} and m = {}.".format(a, m))
    return x % m

def main():
    # Given parameters from the contract
    p = 1124575627794835616567
    p1_x = 983810924364991907519
    p2_x = 1098402780140240490917
    zero_x = 26268578989036317972

    # Compute f(P1) and f(P2) where f(P) = P.x - zero.x (mod p)
    f_p1 = (p1_x - zero_x) % p
    f_p2 = (p2_x - zero_x) % p

    # Compute the modular inverse of f(P1) modulo p
    inv_f_p1 = modinv(f_p1, p)

    # Calculate k using the relation: f(P2) = k * f(P1) mod p
    # So, k = f(P2) * inv(f(P1)) mod p
    k = (f_p2 * inv_f_p1) % p

    print("Calculated value of k =", k)

if __name__ == "__main__":
    main()
