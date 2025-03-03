import "@stdlib/deploy";
message Unlock {
    a: Int;
    b: Int;
}

contract GatekeeperLevel with Deployable {
    player: Address;
    nonce: Int;
    locked: Bool = true;
    completed: Bool = false;
    init(player: Address, nonce: Int){
        self.player = player;
        self.nonce = nonce;
    }

    receive(msg: Unlock){
        require((sender().asSlice().asCell().hash() ^ ((msg.a << 2) + msg.b)) == myAddress().asSlice().asCell().hash(),
            "Check failed."
        );
        self.locked = false;
    }

    receive("check"){
        // send(SendParameters{
        //         to: sender(),
        //         value: 0,
        //         mode: SendRemainingValue,
        //         bounce: false,
        //         body: CheckLevelResult{name: "gatekeeper", completed: !self.locked}.toCell()
        //     }
        // );
    }

    get fun locked(): Bool {
        return self.locked;
    }

    get fun completed(): Bool {
        return self.completed;
    }
}
message Exploit {
    a: Int;
    b: Int;
    address: Address;
}

contract GatekeeperLevelExploit with Deployable {
    player: Address;
    nonce: Int;
    init(player: Address, nonce: Int){
        self.player = player;
        self.nonce = nonce;
    }

    receive(msg: Exploit){
        let target_hash = msg.address.asSlice().asCell().hash();
        let sender_hash = sender().asSlice().asCell().hash();
        let xor = (msg.a << 2) + msg.b;
        dump(sender_hash ^ xor);
        dump(target_hash);
        dump(xor);
    }

    receive("Unlock"){
        self.nonce = 100;
    }

    get fun xor(sender: Address, target: Address): Int {
        let target_hash = target.asSlice().asCell().hash();
        let sender_hash = sender.asSlice().asCell().hash();
        return sender_hash ^ target_hash;
    }

    get fun nonce(): Int {
        return self.nonce;
    }
}