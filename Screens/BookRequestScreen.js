import React,{Component} from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  Flatlist,
  Image,
  Alert} from 'react-native';
import db from '../config';
import firebase from 'firebase';
import MyHeader from '../Components/MyHeader'
import {BookSearch} from 'react-native-google-books'
import { TouchableHighlight } from 'react-native-gesture-handler';
import {Input,Icon} from 'react-native-elements'
import{RFValue} from 'react-native-responsive-fontsize'
export default class BookRequestScreen extends Component{
  constructor(){
    super();
    this.state ={
      userId : firebase.auth().currentUser.email,
      bookName:"",
      reasonToRequest:"",
      isBookRequestActive: '',
      requestedBookName: '',
      boookStatus: '',
      requestId: '',
      userDocId: '',
      docId: '',
    }
  }
  async getBooksFromApi(bookName){
this.setState({
  bookName: bookName
})
if(bookName.length > 2){
  var books = await BookSearch.searchbook(bookName,'AIzaSyBNMjp2tBaYHwPUUR0Qd0xof1zGQlT6HY0')
  this.setState({
    dataSource: books.data,
    showFlatlist: true
  })
}
  }
  renderItem = ({item,i})=>{
    return(
      <TouchableHighlight style = {{allignItems: 'center', backgroundColor: 'black',padding: 10, width: '90%'}}
      activeOpacity ={0.8} underlayColor= '#dddddd' onPress={()=>{
        this.setState({
        showFlatlist: false,
        bookName: item.volumeinfo.title
      })
      
      }}
      bottomeDivider>
       <Text>
         {item.volumeinfo.title}
       </Text>
      </TouchableHighlight>
    )
  }
  createUniqueId(){
    return(
       Math.random().toString().substring(7)
    )
  }
  addRequest=async(bookName,reasonToRequest)=>{
var userId = this.state.userId
var randomRequestId = this.createUniqueId()
var books = await BookSearch.searchbook(bookName,'AIzaSyBNMjp2tBaYHwPUUR0Qd0xof1zGQlT6HY0')
db.collection('requested_books').add({
  'user_id':userId,
  'book_name':bookName,
  'reason_to_request': reasonToRequest,
  'request_id': randomRequestId,
 'book_status': 'requested',
 'date': firebase.firestore.FieldValue.serverTimestamp(),
 'image_link': books.data[0].volumeinfo.imageLinks.smallThumbnail
})
await this.getBookRequest()
db.collections('users').where('email_id','==',userId).get()
.then((snapshot)=>{
  snapshot.forEach(doc =>{
    db.collections('users').doc(doc.id).update({isBookRequestActive:true})
  })
})
  }
componentDidMount(){
  this.getBookRequest();
  this.getIsBookRequestActive();
}
updateBookRequestStatus=()=>{
  db.collection('requested_books').doc(this.state.docId).update({
    book_status: 'recieved'
  })
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach(doc =>{
      db.collection('users').doc(doc.id).update({
        isBookRequestActive: false
      })
    })
  })
 
}
sendNotification=()=>{
  db.collection('users').where('email_id','==',this.state.userId).get()
  .then((snapshot)=>{
    snapshot.forEach(doc =>{
      var name = doc.data().first_name;
      var lastName = doc.data().last_name
    })
  })
  db.collection('all_notifications').where('request_id','==',this.state.requestId).get().
  then((snapshot)=>{
    snapshot.forEach(doc =>{
      var donorId = doc.data().donor_id
      var bookName = doc.data().book_name
    })
  })
  db.collection('all_notifications').add({
    'targeted_user_id' : donorId,
    'message' : name + ' ' + lastName + ' recieved the book ' + bookName,
    'notification_status' : 'unread',
    'book_name' : bookName
  })
}
  createUniqueId(){
    return Math.random().toString(36).substring(7);
  }

getBookRequest=()=>{
  db.collection('requested_books').where('user_id','==',this.state.userId).get()
  .then(snapshot=>{
    snapshot.forEach(doc => {
      if(doc.data().book_status === 'recieved'){
        this.setState({
          requestId: doc.data().request_id,
          requesetedBookName: doc.data().book_name,
          bookStatus: doc.data().book_status,
          docId: doc.id
        })
      }
    })
  })
}
getIsBookRequestActive(){
  db.collection('users').where('email_id','==',this.state.userId)
  .onSnapshot((snapshot)=>{
    snapshot.forEach(doc=>{
      this.setState({
        isBookRequestActive : doc.data().isBookRequestActive,
        userDocId: doc.id
      })
    })
  })
}
  addRequest =(bookName,reasonToRequest)=>{
    var userId = this.state.userId
    var randomRequestId = this.createUniqueId()
    db.collection('requested_books').add({
        "user_id": userId,
        "book_name":bookName,
        "reason_to_request":reasonToRequest,
        "request_id"  : randomRequestId,
    })

    this.setState({
        bookName :'',
        reasonToRequest : ''
    })

    return Alert.alert("Book Requested Successfully")
  }


  render(){
    if(this.state.isBookRequestActive === true){
      return(
        <View style={{flex:1, justifyContent:'center'}}>
          <View style={{borderColor:'orange', justifyContent:'center',allignItems: 'center',padding:5}}>
           <Text>
             Book Name
           </Text>
           <Text>
             {this.state.requesetedBookName}
           </Text>
          </View>
          <View style={{borderColor:'orange', justifyContent:'center',allignItems: 'center',padding:5}}>
           <Text>
             Book Status
           </Text>
           <Text>
             {this.state.bookStatus}
           </Text>
          </View>
          <TouchableOpacity style = {{borderColor: 'orange', borderWidth: 1, backgroundColor: 'orange', width : 300, allignSelf: 'center', allignItems: 'center', height: 30, marginTop:30}}
          onPress={()=>{
            this.sendNotification();
            this.updateBookRequestStatus()
            this.recievedBooks(this.state.requesetedBookName())
          }}>
           <Text>
             I have recieved the book!
           </Text>
          </TouchableOpacity>
        </View>
      )
    }
    else{
    return(
        <View style={{flex:1}}>
          <MyHeader title="Request Book" navigation ={this.props.navigation}/>
            <View style={styles.keyBoardStyle}>
              <Input
                style ={styles.formTextInput}
                label = {'Book Name'}
                containerStyle ={{marginTop: RFValue(60)}}
                placeholder={"enter book name"}
                onChangeText={(text)=>{
                    this.setState({
                        bookName:text
                    })
                }}
                onClear={(text)=>{
                  this.getBooksFromApi('')
                }}
                value={this.state.bookName}
              />
              {this.state.showFlatlist?
            (<Flatlist data = {this.state.dataSource}
              renderItem = {this.renderItem}
              enableEmptySections = {true}
              style = {{marginTop: 10}}
              keyExtractor = {(item,index) => index.toString()}/>):(<View>
              <Input
                style ={[styles.formTextInput,{height:300}]}
                containerStyle={{marginTop:RFValue(20)}}
                label={'Reason'}
                multiline
                numberOfLines ={8}
                placeholder={"Why do you need the book"}
                onChangeText ={(text)=>{
                    this.setState({
                        reasonToRequest:text
                    })
                }}
                value ={this.state.reasonToRequest}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={()=>{this.addRequest(this.state.bookName,this.state.reasonToRequest)}}
                >
                <Text>Request</Text>
              </TouchableOpacity>
            </View>
            )  
            }
            </View>
        </View>
    )
  }
}
}
const styles = StyleSheet.create({
  keyBoardStyle : {
    flex:1,
    alignItems:'center',
    justifyContent:'center'
  },
  formTextInput:{
    width:"75%",
    height:35,
    alignSelf:'center',
    borderColor:'#ffab91',
    borderRadius:10,
    borderWidth:1,
    marginTop:20,
    padding:10,
  },
  button:{
    width:"75%",
    height:50,
    justifyContent:'center',
    alignItems:'center',
    borderRadius:10,
    backgroundColor:"#ff5722",
    shadowColor: "#000",
    shadowOffset: {
       width: 0,
       height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    marginTop:20
    },
  }
)