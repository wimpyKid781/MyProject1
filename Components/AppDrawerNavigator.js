import React from 'react';
import {createDrawerNavigator} from 'react-navigation-drawer';
import { AppTabNavigator } from './AppTabNavigator'
import {Icon} from 'react-native-elements'
import CustomSideBarMenu  from './CustomSideBarMenu';
import MyDonationScreen from '../Screens/MyDonationScreen';
import NotificationScreen from '../Screens/NotificationScreen';
import SettingScreen from '../Screens/SettingScreen';

export const AppDrawerNavigator = createDrawerNavigator({
  Home : {
    screen : AppTabNavigator,
    navigationOptions :{
      drawerIcon: <Icon 
      name = 'home'
      type = 'fontawesome5'
      />
    }
    },
  MyDonations : {
    screen : MyDonationScreen,
    navigationOptions :{
      drawerIcon: <Icon 
      name = 'gift'
      type = 'font-awesome'
      />,
      drawerLabel: 'My Donations'
    }
  },
  Notification : {
    screen : NotificationScreen,
    navigationOptions :{
      drawerIcon: <Icon 
      name = 'bell'
      type = 'font-awesome'
      />,
      drawerLabel: 'My Notifications'
    }
  },
  Setting : {
    screen : SettingScreen,
    navigationOptions :{
      drawerIcon: <Icon 
      name = 'settings'
      type = 'font-awesome'
      />,
      drawerLabel: 'Settings'
    }
  }
},
  {
    contentComponent:CustomSideBarMenu
  },
  {
    initialRouteName : 'Home'
  })