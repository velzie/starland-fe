export const Container: Component<{ class?: any, title?: string }, { children: any }> = function() {
  this.css = css`
  self {
    position: relative;
    border: 1px solid var(--accent);
  }
  .pseudo{
    position: absolute;
    display: flex;
    top:0;
    left: 1em;
    transform: translateY(-50%);
  }
  .title {

    padding-left:4px;
    padding-right:4px;
    background-color: var(--surface);
    /* font-size: 15px; */
  }
  .bar {
    position: relative;
    height: 13px;
    top: 4px;

    width: 1px;
    background-color: var(--accent);
    z-order: 3;
  }
`;
  this.class ??= [];

  return (
    <div class={[...this.class]}>
      {this.title &&
        <div class="pseudo">
          <div class="bar"></div>
          <div class="title">
            {this.title}
          </div>
          <div class="bar"></div>
        </div>
        || ""
      }
      {this.children}
    </div>
  )
}
