const { Config, Post } = props;

const communities = [
  {
    id: "og",
    name: "OGs",
    rules: {
      SBTs: ["community.i-am-human.near"],
    },
  },
  {
    id: "general",
    name: "General",
    rules: {},
  },
];

State.init({
  community: "og",
});

const activeCommunity = communities.find((c) => c.id === state.community);

const index = [
  {
    action: Config.postDataKey,
    key: state.community,
    options: {
      limit: 10,
      order: "desc",
    },
    cacheOptions: {
      ignoreCache: true,
    },
  },
];

const handleCreatePost = (body) => {
  Post.create(
    {
      body: body,
      type: "md",
      community: state.community,
      tags: [],
    },
    () => console.log("posted successfully"),
    () => console.log("user canceled"),
    (e) => console.log("error", e),
  );
};

// -- Gating based on Community Rules
let canPost = true;

if (Array.isArray(activeCommunity.rules.SBTs)) {
  // user should have the SBTs
  activeCommunity.rules.SBTs.forEach((SBT) => {
    const allSBTs = Near.view(Config.SBTRegistry, "sbt_tokens_by_owner", {
      account: context.accountId,
    });

    if (allSBTs === null) return "";
    const hasSBT = (allSBTs || []).find((s) => s[0] === SBT)[1].length > 0;
    canPost = canPost && hasSBT;
  });
}

// -- End
return (
  <div className="d-flex gap-4 p-4 w-100">
    <div className="d-flex flex-column gap-4 flex-fill">
      <select
        onChange={({ target: { value } }) => {
          State.update({ community: value });
        }}
      >
        {communities.map((c, i) => {
          return (
            <option value={c.id} selected={state.community === c.id}>
              {c.name}
            </option>
          );
        })}
      </select>
      <Widget
        src="/*__@replace:nui__*//widget/Social.PostCompose"
        props={{
          onPost: handleCreatePost,
          disabled: !canPost,
        }}
      />
      <Widget
        src="mob.near/widget/MergedIndexFeed"
        props={{
          index,
          renderItem: (p) => {
            return (
              <Widget
                src="/*__@appAccount__*//widget/pages.feed.post"
                props={{ ...p, Config, Post, communities }}
              />
            );
          },
        }}
      />
    </div>
    <div className="d-lg-block d-none" style={{ width: 300 }}>
      sidebar
    </div>
  </div>
);
