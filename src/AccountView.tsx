import { flex, gap, hcenter, inlineflex, wcenter } from "./css"
import { Account } from "./state"


export const AccountView: Component<{
    account: Account
    showpfp?: boolean
    showfavicon?: boolean
}, {}> = function() {
    this.css = css`
self {
    background-color: var(--surface);
    padding: 2px;
    border-radius: 4px;
}
a{
    text-decoration: none;
    color: var(--accent-inactive);
}
img {
    margin-left: 3px;
}
`;
    return (
        <span class={[inlineflex, hcenter, rule`gap: 3px`]}>
            {this.showpfp &&
                <img src={this.account?.avatar} width="16" height="16" />
                || ""
            }
            <a href="skibidi">
                @{this.account?.acct}
            </a>
            {
                this.showfavicon &&
                <img src={this.account?.pleroma?.favicon} width="16" height="16" />
                || ""
            }
        </span>
    )
}
