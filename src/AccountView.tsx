import { flex, gap, hcenter, inlineflex, wcenter } from "./css"
import { Account } from "./state"

export const AccountView: Component<{
    account: Account
    showpfp?: boolean
    showfavicon?: boolean
}, {}> = function() {
    return (
        <div class={[inlineflex, hcenter, rule`gap: 3px`]}>
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
