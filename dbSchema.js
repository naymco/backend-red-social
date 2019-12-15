let db = {
  users: [
    {
      userId: "dh23ggj5h32g543j5gf43",
      email: "user@email.com",
      handle: "user",
      createdAt: "2019-03-15T10:59:52.798Z",
      imageUrl: "image/alksdflksf/lskafjlskfjslkf",
      bio: "Hello, my name is user, nice to meet you",
      website: "https://user.com",
      location: "London, UK"
    }
  ],
  screams: [
    {
      userHandle: "user",
      body: "this is the scream body",
      createdAt: "2019-03-15T11:46:01.018Z",
      likeCount: 5,
      commentCount: 2
    }
  ]
};

const userDetails = {
  //Redux Data
  credentials: {
    userId: "dh23ggj5h32g543j5gf43",
    email: "user@email.com",
    handle: "user",
    createdAt: "2019-03-15T10:59:52.798Z",
    imageUrl: "image/alksdflksf/lskafjlskfjslkf",
    bio: "Hello, my name is user, nice to meet you",
    website: "https://user.com",
    location: "London, UK"
  },
  likes: [
    {
      userHandle: "user",
      screamId: "hh705oWfQucVzGbHH2pa"
    },
    {
      userHandle: "user",
      screamId: "3I0nFoQexRcofs50hBXO"
    }
  ]
};
