import { flex, gap, hcenter } from "./css"
import { Account } from "./state"

export type AccountView = DLComponent<{
    account: Account
    showpfp: boolean
    showfavicon: boolean
}>
export function AccountView(this: AccountView) {
    return (
        <div class={[flex, hcenter]}>
            {this.showpfp &&
                <img src={this.account?.avatar} width="16" height="16" />
                || ""
            }
            <a href="skibidi">
                {this.account?.acct}
            </a>
            {
                this.showfavicon &&
                <img src={this.account?.pleroma?.favicon} width="16" height="16" />
                || ""

            }
        </div>
    )
}
