# Prize vault

It is generally a good practice to isolate logically unrelated functionality to separate modules or, in the case of TON, to separate smart-contracts. That way it is ofter easier to cover each module with tests and be sure it works as intended.

This task is dedicated to the system of prize distribution amongst contestant. It is organized as two separate contracts: prize vault and database.

Prize vault stores the prize, and for every request check in database whether request sender is a winner and if yes where to send the prize.

Database is simple hashmap based db, where each contestant may register to set payout address, while admin may set which contestant is the winner.
