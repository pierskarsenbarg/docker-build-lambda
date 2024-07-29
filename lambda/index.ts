import * as cowsay from "cowsay";

export const handler = async () => {
    console.log(cowsay.say({
        text: "Pulumi <3 Lambda!"
    }));
}