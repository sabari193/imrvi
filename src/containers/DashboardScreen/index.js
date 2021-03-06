import React from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import _ from 'lodash';
import { ProfileMenuHeader, colors } from '../../components/PocketUI/index';
import realm from '../../providers/realm';

export default class DashboardScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      clusterID: '',
      villageName: '',
      categoryA: '-',
      categoryB: '-',
      categoryC: '-',
      TypeA: 0,
      TypeB: 0,
      TypeC: 0,
      clusterPrimaryID: '',
      surveyDetails: []
    };
  }
  async loadCategoryDetails() {
    const clusterDetails = JSON.parse(JSON.stringify(realm.objects('Cluster').filtered('status="active"')));
    this.setState({
      clusterPrimaryID: clusterDetails[0].clusterPrimaryID,
      clusterID: clusterDetails[0].clusterID,
      villageName: clusterDetails[0].villageName,
      categoryA: realm.objects('Household').filtered('clusterID=$0 AND Category="A" AND Submitted="inprogress"', clusterDetails[0].clusterID).length,
      categoryB: realm.objects('Household').filtered('clusterID=$0 AND Category="B" AND Submitted="inprogress"', clusterDetails[0].clusterID).length,
      categoryC: realm.objects('Household').filtered('clusterID=$0 AND Category="C" AND Submitted="inprogress"  ', clusterDetails[0].clusterID).length,
    });
    if (realm.objects('BloodSample').filtered('Submitted="active"').length > 0) {
      this.setState({
        TypeA: realm.objects('BloodSample').filtered('clusterID=$0 AND Submitted="active"', clusterDetails[0].clusterID)[0].TypeA,
        TypeB: realm.objects('BloodSample').filtered('clusterID=$0 AND Submitted="active"', clusterDetails[0].clusterID)[0].TypeB,
        TypeC: realm.objects('BloodSample').filtered('clusterID=$0 AND Submitted="active"', clusterDetails[0].clusterID)[0].TypeC
      });
    }
    console.log('BloodSample', realm.objects('BloodSample').length);
    console.log(realm.objects('Household').filtered('clusterID=$0 AND Category="A"', clusterDetails[0].clusterID).length);
  }
  componentWillMount() {
    this.loadCategoryDetails();
  }
  deleteCluster() {
    Alert.alert(
      'Delete Cluster Information',
      'Do you want to delete cluster information',
      [
        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        {
          text: 'OK',
          onPress: () => {
            realm.write(() => {
              const householdDetails = JSON.parse(JSON.stringify(realm.objects('Household')));
              _.forEach(householdDetails, (house) => {
                realm.create('Household', { id: house.id, Submitted: 'deleted' }, true);
              });
              const householdNumberDetails = JSON.parse(JSON.stringify(realm.objects('HouseholdNumber')));
              _.forEach(householdNumberDetails, (household) => {
                realm.create('HouseholdNumber', { HouseholdPrimary: household.HouseholdPrimary, Submitted: 'deleted' }, true);
              });
              realm.create('Cluster', {
                clusterPrimaryID: this.state.clusterPrimaryID,
                status: 'deleted'
              }, true);
              realm.delete(realm.objects('RandomSurvey'));
              realm.delete(realm.objects('SurveyDetails'));
              realm.delete(realm.objects('SurveyInformation'));
              if (realm.objects('BloodSample').length > 0) {
                const bloodsampleid = realm.objects('BloodSample').filtered('Submitted="active" || Submitted="completed" && clusterID=$0', this.state.clusterID)[0].id;
                realm.create('BloodSample', { id: bloodsampleid, Submitted: 'deleted' }, true);
              }
              this.navigateToSignIn();
            });
          }
        },
      ],
      { cancelable: false }
    );
  }
  navigateToSignIn() {
    const { dispatch } = this.props.navigation;
    dispatch({ type: 'goToHome' });
  }
  showClusterHisttory() {
    const { dispatch } = this.props.navigation;
    dispatch({ type: 'ClusterHistoryScreen' });
  }
  generateRandomSurvey(props) {
    const { dispatch } = this.props.navigation;
    dispatch({ type: 'goToRandomListScreen' });
  }
  gotoHouseholdScreen() {
    const { dispatch } = this.props.navigation;
    dispatch({ type: 'goToHouseHold' });
  }
  gotoEditHouseholdScreen() {
    const { dispatch } = this.props.navigation;
    dispatch({ type: 'goToViewCluster' });
  }

  gotoCompletedSurvey() {
    const { navigate } = this.props.navigation;
    const surveyDatafromRealm = JSON.parse(JSON.stringify(realm.objects('RandomSurvey')))[0].surveyDetails;
    this.setState({ surveyDetails: surveyDatafromRealm });
    navigate('CompletedSurveyDetails', { surveyDetails: surveyDatafromRealm });
  }
  render() {
    return (
      <View style={{ backgroundColor: '#fff', flex: 1 }}>
        <ScrollView>
          {(this.state.clusterID) &&
            <ProfileMenuHeader
              headingIcon="IMRVI"
              heading={`${this.state.clusterID} - ${this.state.villageName}`}
              icon1Title="Add Household"
              icon2Title="Edit Household"
              icon3Title="Survey Details"
              icon4Title="Completed Survey"
              icon5Title="Cluster History"
              icon6Title="Cluster Logout"
              onPressIcon1={this.gotoHouseholdScreen.bind(this)}
              onPressIcon2={this.gotoEditHouseholdScreen.bind(this)}
              onPressIcon3={this.generateRandomSurvey.bind(this)}
              onPressIcon4={this.gotoCompletedSurvey.bind(this)}
              onPressIcon5={this.showClusterHisttory.bind(this)}
              onPressIcon6={this.deleteCluster.bind(this)}
              navigation={this.props.navigation}
            />
          }
          <View>
            <Text style={styles.headingLetter1}>Census --> A : {this.state.categoryA} || B : {this.state.categoryB} || C : {this.state.categoryC}</Text>
            <Text style={styles.headingLetter2}>Blood Collected --> A : {this.state.TypeA} || B : {this.state.TypeB} || C : {this.state.TypeC}</Text>
          </View>
        </ScrollView>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  headingLetter1: {
    color: '#3E4A59',
    fontWeight: '700',
    fontSize: 23,
    marginLeft: 20,
    marginTop: 50,
    textAlign: 'center',
    color: 'green'
  },
  headingLetter2: {
    color: '#3E4A59',
    fontWeight: '700',
    fontSize: 23,
    marginLeft: 20,
    marginTop: 10,
    textAlign: 'center',
    color: 'red'
  }
});
