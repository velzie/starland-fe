import { Container } from "./Container";
import { ContentRenderer } from "./ContentRenderer";
import { Post } from "./Post";
import { borderbox, col, flex, gap, h100, padding, scrolly, w100 } from "./css";
import { Account, Status, parseStatus, state, statuses } from "./state";

export const Notifications: Component<{
}, {
  fetchnotifs: () => Promise<void>
  notifs_since_id: number
  notifs: ComponentElement<typeof NotificationView>[]
}> = function() {
  this.notifs = [];
  this.fetchnotifs = async function() {
    let req = await fetch("/api/v1/notifications?limit=20" + (this.notifs_since_id && `&since_id=${this.notifs_since_id}` || ""));
    let notifs = await req.json();

    if (notifs.length > 0)
      this.notifs_since_id = notifs[0].id;
    for (const notification of notifs) {
      const { account, id, created_at, status, type } = notification;
      if (status)
        await parseStatus(status);


      let view = <NotificationView notification={notification} />;

      this.notifs = [...this.notifs, view];
    }
  }

  handle(use(state.user), async () => {
    // clear notifs when user changes
    this.notifs = [];
    await this.fetchnotifs();
  });



  this.mount = () => {
    setInterval(() => {
      if (state.user)
        this.fetchnotifs();
    }, 5000);
  }

  return (
    <Container class={[padding, borderbox, w100, h100]} title="notifications">
      <div>
        {$if(use(state.user),
          <div class={[flex, col, scrolly, h100, w100, gap, rule`scrollbar-width: none; padding-right: 1em`]}>
            {use(this.notifs)}
          </div>,
          <div>
            Sign in to see notifications
          </div>
        )}
      </div>
    </Container>
  );
}

export type Notification = {
  account: Account
  created_at: string
  id: string
  pleroma: { is_muted: boolean, is_seen: boolean }
  status: Status
  type: "mention" | "favourite" | "reblog"
};

export const NotificationView: Component<{
  notification: Notification
}, {}> = function() {
  this.css = css`
.img {
  border-radius: 5px;
}
`;

  let status = statuses.get(this.notification.status?.id)!;

  return (
    <div class={[flex, gap, borderbox, w100]}>
      <div>
        <img class="img" src={this.notification.account.avatar} width="32" height="32" />
      </div>
      <div class={[flex, col, rule`flex: 1`]}>
        <div>
          {this.notification.account.acct}
          {" "}
          {this.notification.type === "favourite" && "favourited" || ""}
        </div>
        <div>

          {this.notification.type === "mention" &&
            <Post post={statuses.get(this.notification.status.id)!} hideauthor />
            || this.notification.type === "favourite" &&
            <div>
              <ContentRenderer post={status} />
            </div>
            || ""}
        </div>
      </div>
    </div>)
}

