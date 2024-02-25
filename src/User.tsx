import { Container } from "./Container";
import { Timeline } from "./Timeline";
import { col, flex, gap, padding, scrolly, wevenly } from "./css";
import { KnownAccount, accounts, parseAccount } from "./state";

export const User: Component<{

}, {
  id: string | null
  account: KnownAccount
}> = function() {
  this.css = css`
span.divider {
  border-top: 1px solid var(--accent);
}
.pfp { 
  border-radius: 5px;
}
.banner {
  background: url(${use(this.account.account.header_static)});
}
.banner:hover {
  background: url(${use(this.account.account.header)});
}

.profileactions {
  button {
    background-color: transparent;
    backdrop-filter: blur(15px);
    padding: 0.6em;
    border: 1px solid var(--accent);
    border-radius: 5px;
  }
}
`
  this.id = "ASKCaK4BkIs4eLgQ2S";

  handle(use(this.id), async () => {
    if (accounts.has(this.id!)) {
      this.account = accounts.get(this.id!)!;
      return;
    }

    let resp = await fetch(`/api/v1/accounts/${this.id}/?with_relationships=true`)
    let account = await resp.json();
    this.account = parseAccount(account);
    console.log(account);
  });

  return <div class={[flex, col, scrolly]}>
    <Container class={[padding, rule`margin: 1em; margin-bottom: 0`]} title={use(this.account.account.acct) as any}>
      <div>
        {$if(use(this.account),
          <div class={[flex, col, gap, padding, "banner"]}>
            <div class={[flex, gap, wevenly]}>
              <div class={[flex, gap]}>
                <img class={["pfp"]} width="64" height="64" src={use(this.account.account.avatar)} alt={use(this.account.account.username)} />
                <div class={[flex, col]}>
                  <h3>
                    {use(this.account.account.display_name)}
                  </h3>
                  {use(this.account.account.acct)}
                </div>
              </div>
              <div>
                <div class={[flex, gap, "profileactions"]}>
                  <button on:click={() => {

                  }}>Block</button>
                  <button on:click={() => {

                  }}>Follow</button>
                </div>
              </div>
            </div>
            <div class={[]}>
              {use(this.account.account.note)}
            </div>
            <div class={[flex, wevenly]}>
              <div>
                {use(this.account.account.followers_count)} {" "} followers
              </div>
              <div>
                {use(this.account.account.following_count)} {" "} following
              </div>
              <div>
                {use(this.account.account.statuses_count)} {" "} posts
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
    {use(this.account, () =>
      <Timeline kind={`accounts/${this.id}/statuses`} />
    )}
  </div>
}
