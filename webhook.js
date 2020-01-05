const express = require('express')
const { WebhookClient } = require('dialogflow-fulfillment')
const app = express()
const fetch = require('node-fetch')
const base64 = require('base-64')

let username = "";
let password = "";
let token = "";
let URL ="https://mysqlcs639.cs.wisc.edu/";

async function getToken () {
  let request = {
    method: 'GET',
    headers: {'Content-Type': 'application/json',
              'Authorization': 'Basic '+ base64.encode(username + ':' + password)},
    redirect: 'follow'
  }

  const serverReturn = await fetch('https://mysqlcs639.cs.wisc.edu/login',request)
  const serverResponse = await serverReturn.json()
  token = serverResponse.token

  return token;
}

app.get('/', (req, res) => res.send('online'))
app.post('/', express.json(), (req, res) => {
  const agent = new WebhookClient({ request: req, response: res })

  function welcome () {
    
    agent.add('Hello there!');
    agent.add('My name is Little AI 🤪');
    agent.add('I was created by Zhaoyin.');
    agent.add('You can log in first to unlock more functions.');
    agent.add('Say: username your name and password your password');
}

  async function login () {
    // You need to set this from `username` entity that you declare in DialogFlow
    username = agent.parameters.username;
    // You need to set this from password entity that you declare in DialogFlow
    password = agent.parameters.password;
    await getToken();
    if (!token) {
      message("Failed",false);
      message(" Oh no! The username or password is wrong!", false);
      message(" Please check again", false);
      agent.add(" Failed");
      agent.add(" Oh no! The username or password is wrong!");
      agent.add(" Please check again");
    } else {
      message("User loged in",true);
      message("Successful!",false);
      message("You can ask me questions like show me the categories.",false);
      agent.add("Successful!");
      agent.add("You can ask me questions like show me the categories.");
    }
  }

  async function getCategories() {
    let request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    let response = await fetch(URL + "categories", request);
    response = await response.json();
    return response.categories;
  }

  async function getCategoryTag(category) {
    let request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    let response = await fetch(
      URL + "categories/" + category + "/tags",
      request
    );
    response = await response.json();
    return response.tags;
  }

  async function queries() {
    if (username == null || username === "") {
      agent.add("Hey!");
      agent.add("Login first and try later.");
      return;
    }
    const category = agent.parameters.category;
    const showcat = agent.parameters.showcat;
    const cart = agent.parameters.cart;
    if(cart){
      let request = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token
        }
      };
      let response = await fetch(URL + "application/products", request);
      response = await response.json();
      const products = response.products;
      //console.log(products);
      message("go to the cart", true);
      message("Here is your chart",false);
      agent.add("Here is your chart");
      for (let i = 0; i < products.length; i++) {
        message(""+(i+1),false);
        message("Item: "+products[i].name,false);
        message("Category: "+products[i].category,false);
        message("Count :"+products[i].count,false);
        message("Price: $"+products[i].price,false);
        agent.add(""+(i+1));
        agent.add("Item: "+products[i].name);
        agent.add("Category: "+products[i].category);
        agent.add("Count :"+products[i].count);
        agent.add("Price: $"+products[i].price);
       
        agent.add("---------------");
        agent.add("---------------");

      }
  
       let totalPrice = 0;
       let totalCount = 0;
      for (let i = 0; i < products.length; i++) {
        totalPrice += parseFloat(products[i].price);
      }
      for (let i = 0; i < products.length; i++) {
        totalCount += parseFloat(products[i].count);
      }
       message("Total Count:  " + totalCount,false);
       message("Total Prise: $" + totalPrice,false);
       message("Do you confirm the cart?",false);
       agent.add("Total Count:  " + totalCount);
       agent.add("Total Prise: $" + totalPrice);
       agent.add("Do you confirm the cart?");
  } 

  if (showcat) {
    let request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    let response = await fetch(URL + "categories", request);
      response = await response.json();
      const showcate = response.categories;
      message("list the category",true);
      message(""+showcat,false);
      agent.add(showcate);
  } 
    
    if (category) {
      message("tags of the "+ category,true);
      let tags = await getCategoryTag(category);
      message("tags ofthe "+category, true);
      message("Here is a list of tags for "+ category+":", false);
      message("tags.join(", ")",false);
      agent.add("Here is a list of tags for "+ category+":");
      agent.add(tags.join(", "));
    } 
    if(!category&&!cart&&!showcat)  {
      message("tags of the "+ category,true);
      message("OMG, I cannot find the tag for this category.",false);
      message("Here is a list of all products:",false);
      agent.add("OMG, I cannot find the tag for this category.");
      agent.add("Here is a list of all products:");
      let categories = await getCategories();
      message("categories.join(", ")",false);
      agent.add(categories.join(", "));
      }
     
  }

  async function getCategories() {
    let request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    let response = await fetch(URL + "categories", request);
    response = await response.json();
    return response.categories;
  }

  async function getProducts() {
    let request = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    let response = await fetch(URL + "products", request);
    response = await response.json();
    return response.products;
  }

  async function productsInfo() {
    if (username == null || username === "") {
      message("Hey!",false);
      message("Login first and try later.",false);
      agent.add("Hey!");
      agent.add("Login first and try later.");
      return;
    }

    let thisName = agent.parameters.product;
    let products = await getProducts();
    
    
    for (let i = 0; i < products.length; i++) {
    if (products[i].name.toLowerCase() === thisName.toLowerCase()){
         var id =products[i].id;
         let request = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token
          }
        };
        let review = await fetch(
          URL + "products/" + id + "/reviews",
          request
        );
        review = await review.json();
        let reviews = review.reviews;
        let aveStar = 0;
        let ln=0;
        message("Information about "+ products[i].name, true);
        message("Name: "+products[i].name, false);
        message("Category: "+products[i].category,false);
        message("Price: $"+products[i].price,false);
        message("Description: "+products[i].description,false);
         agent.add("Name: "+products[i].name);
         agent.add("Category: "+products[i].category);
         agent.add("Price: $"+products[i].price);
         agent.add("Description: "+products[i].description);
         agent.add("------------");
         agent.add("Review Starts Here!");
         for (let j = 0; j < reviews.length; j++) {
          ln=(j+1);
          aveStar=aveStar+reviews[j].stars;
          message("Title: "+reviews[j].title,false);
          message("Stars: "+ reviews[j].stars,false);
          message("Detail: "+reviews[j].text,false);
          agent.add("Title: "+reviews[j].title);
          agent.add("Stars: "+ reviews[j].stars);
          agent.add("Detail: "+reviews[j].text);
          agent.add("------------");
          }
          aveStar=aveStar/ln
          message("Average Star: "+aveStar,false);
          agent.add("Average Star: "+aveStar);
          return;
    }
}
    message("OMG! I cannot find the item.",false);
    message("Try to search other items~~~",false);
    agent.add("OMG! I cannot find the item.");
    agent.add("Try to search other items~~~");
  
  }

  async function tags() {
    if (username == null || username === "") {
      agent.add("Hey!");
      agent.add("Login first and try later.");
      return;
    }
    
     let request = {
      method: "GET",
      headers: {
       "Content-Type": "application/json",
      "x-access-token": token
         }
     };
      let response = await fetch(URL + "tags", request);
          response = await response.json();   
      let all = response.tags;
      let method = "GET";
      let tag = agent.parameters.tags;
      let command = agent.parameters.commend;
      message( command+" me all of the"+tag+"ones", true);
          for (let i=0; i<all.length; i++){
          if (all[i]===tag) {
            if (command==="show") {
              method = "POST";
              
            } 
            else if (command==="remove") {
              method = "DELETE";
            }
            let request = {
              method: method,
              headers: {
                "Content-Type": "application/json",
                "x-access-token": token
              }
            };
            try {
              let response = await fetch(
                URL + "application/tags/" + tag,
                request
              );
              response = await response.json();
            if(method==="POST"){
              
              message("Tag added!",false);
              message("I got you!",false);
              agent.add("Tag added!");    
              agent.add("I got you!");
              return;
            } else {
              message("Alright",false);
              message("Tag removed!",false);
              agent.add("Alright");
              agent.add("Tag removed!");
              return;
            }
            } catch (error) {
              message("Invalid try",false);
              agent.add("Invalid try");
             }
            }
          }
      
          message("Tag not found",false);
          agent.add("Tag not found");
  }

 

  async function actionCart() {
    if (username == null || username === "") {
      agent.add("Hey!");
      agent.add("Login first and try later.");
      return;
    }
    let id = -1;
    let addurl = "";
    let method = "GET";
    let thisName = agent.parameters.product;
    let commend = agent.parameters.commend;
    let number = parseInt(agent.parameters.number);
    let products = await getProducts();
    
    for (let i = 0; i < products.length; i++) {
    if (products[i].name.toLowerCase() === thisName.toLowerCase()){
       id =products[i].id;
    }
  }
  if (commend) {
    commend = commend.toLowerCase().trim();
    for (let i = 0; i < products.length; i++) {
      if (products[i].name.toLowerCase() === thisName.toLowerCase()){
         id =products[i].id;
      }
    }
   
  
  if (commend==="yes") {
  message("yes",true);
  message("Cart is confirmed",false)
  agent.add("Cart is confirmed");
  let body = {
    back: false,
    dialogflowUpdated: true,
    page: ""
  };
  body.page = "/"+username+"/cart-confirmed";
  let request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": token
    },
    body: JSON.stringify(body)
  };
  let response = await fetch(URL + "/application", request);
  response = await response.json();
  return "Cart is confirmed. Thank you.";
  
}


  if (commend==="no") {
    message("no",true);
    message("Alright. You can still change your shopping cart",false)
    agent.add("Alright. You can still change your shopping cart");
    }
  if (commend==="add") {
      method = "POST";
      message("add "+number+thisName+" to the cart",true);
      message("Good choice!",false);
      message("Item added",false);
      message("To check the cart, please say: go to the cart"+ false);
      agent.add("Good choice!");
      agent.add("Item added");
      agent.add("To check the cart, please say: go to the cart");
    } 
  if (commend==="remove") {
      method = "DELETE";
      message("remove "+number+" "+thisName+" from the cart",true);
      message("Alright.",false);
      message("Item removed.",false);
      message("To check the cart, please say: go to the cart"+ false);
      agent.add("Alright.");
      agent.add("Item removed.");
      agent.add("To check the cart, please say: go to the cart");
    }
    if (id === -1) {
      message("Prodcut Not Found",false);
      agent.add("Prodcut Not Found");
      return;
    }
  }
    addurl = '/application/products/'+id;
    
    let request = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      }
    };
    for (let i = 0; i < number; i++) {
      let response = await fetch(URL + addurl, request);
      response = await response.json();
      console.log(i, response);
    }
  }

  async function message(talk, isUser) {
    let request = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify({
        isUser: isUser,
        text: talk
      })
    };

    let response = await fetch(URL + "application/messages", request);
    response = await response.json();
  }

  async function navigate() {
    if (username == null || username === "") {
      agent.add("Hey!");
      agent.add("Login first and try later.");
      return;
    }
    let body = {
      back: false,
      dialogflowUpdated: true,
      page: ""
    };
    
    let categoryPage = agent.parameters.category;
    let navigate= agent.parameters.navigate;
    
     if (navigate) {
      message("take me to the "+navigate+" page",true);
          if(navigate==="sign up"){
            body.page='/signUp';
          }
          if(navigate==="log in"){
            body.page='/signIn';
          }
          if(navigate==="home"){
            body.page='/'+username;
          }
          message(navigate+"page is here!",false);
           agent.add(navigate+"page is here!");
           
        }
      if(categoryPage){
        message("take me to the "+categoryPage+" page",true);
        let request = {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token
          }
        };
        let response = await fetch(URL + "categories", request);
        response = await response.json();
        const categories = response.categories;
        if (categories.includes(categoryPage)) {
          body.page = "/"+username+"/"+categoryPage
        }
        else{
          message("Oh No, page is not found",false);
          agent.add("Oh No, page is not found");
        }
      }

  

    let request = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": token
      },
      body: JSON.stringify(body)
    };
    let response = await fetch(URL + "/application", request);
    response = await response.json();
    return "Here you are";
}
  let intentMap = new Map()
  intentMap.set('Default Welcome Intent', welcome)
  // You will need to declare this `Login` content in DialogFlow to make this work
  intentMap.set('Login', login) ;
  intentMap.set('Queries', queries) ;
  intentMap.set('ShowCat', queries) ;
  intentMap.set('Cart', queries) ;
  intentMap.set('Products', productsInfo) ;
  intentMap.set('Tags', tags) ;
  intentMap.set('Action', actionCart) ;
  intentMap.set("navigate", navigate);
  agent.handleRequest(intentMap)
})

app.listen(process.env.PORT || 8080)
