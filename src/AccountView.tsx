import { flex, hcenter } from "./css"
import { Account } from "./state"

export type AccountView = DLComponent<{
    account: Account
    showpfp: boolean
}>
export function AccountView(this: AccountView){
    return (
        <div class={[flex,hcenter]}>
            <a href="skibidi">
                {this.account.acct}
            </a>
            {/* <img src={this.account.pleroma.favicon} /> */}
        </div>
    )
}