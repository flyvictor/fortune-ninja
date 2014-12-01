var ninja = require("../")(),
    should = require("should"),
    fortuneClient = require("fortune-client");

var port = 5707;

describe("Fortune Ninja", function(){
  
  before(function(done){
    this.timeout(5000);
    
    var connectionString = "mongodb://localhost/fortune-ninja-test";
    
    fortuneClient([
      require("fortune")({
        adapter: "mongodb",
        connectionString: connectionString
      }).resource("user", {
        name: String,
        pets: [{ref: "pet", inverse: "owner"}]
      }).resource("pet", {
        name: String,
        owner: {ref: "user", inverse: "pets"}
      }).listen(port)
    ]).ready.then(function(client){
      return ninja.connect({
        databases: [connectionString],
        fortuneClient: client,
        baseUrl: "http://localhost:" + port
      });
    }).then(function(){
      return ninja.wipeCollections();
    }).done(done);
  });

  beforeEach(function(done){
    done();
  });

  it("creates compound fixtures", function(done){
    ninja.fixture.create("users", {
      name: "Bob",
      pets: ninja.fixture.create("pets",{name: "Dog"}).then(function(data){
        console.log("create pets data", data);
        return data;
      })
    }).then(function(data){
      console.log(JSON.stringify(data, null, 2) );
      return ninja.fortuneClient.getPets(null);
    }).then(function(data){
      console.log("pets data", data);
      return ninja.fortuneClient.getUsers(null,{include: "pets"});
    }).then(function(data){
      data.users.length.should.be.equal(1);
      data.linked.pets.length.should.be.equal(1);
      data.users[0].links.pets[0].should.be.equal(data.linked.pets[0].id);
    }).done(done);
  });

  afterEach(function(done){
    ninja.wipeCollections().then(done);
  });
});
