let db = {
  users: [
    {
      userId: 'dh23ggj5h32g543j5gf43',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2020-06-23T02:37:38.881Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Bulacan, PH',
    },
  ],
  screams: [
    {
      userHandle: 'user',
      body: 'scream body',
      createdAt: '2020-06-23T02:37:38.881Z',
      likeCount: 5,
      commentCount: 2,
    },
  ],
  comments: [
    {
      userHandle: 'user',
      userImage: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      screamId: 'zl9p9KTcNAMiNtDpssan',
      body: 'shout out please!',
      createdAt: '2020-06-23T02:37:38.881Z',
    },
  ],
};

const userDetails = {
  // Redux data
  credentials: {
    userId: 'dh23ggj5h32g543j5gf43',
    email: 'user@email.com',
    handle: 'user',
    createdAt: '2020-06-23T02:37:38.881Z',
    imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
    bio: 'Hello, my name is user, nice to meet you',
    website: 'https://user.com',
    location: 'Bulacan, PH',
  },
  likes: [
    {
      userHandle: 'user',
      screamId: 'hh7O5oWfWucVzGbHH2pa',
    },
    {
      userHandle: 'user',
      screamId: '3IOnFoQexRcofs5OhBXO',
    },
  ],
};
