import React from 'react';
import { StyleSheet, View, ScrollView, DatePickerAndroid, Switch } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import {
    FormRow, colors, Button, AddCardHeader,
    FormInput, FormLabel, Text
} from '../../components/PocketUI/index';
import moment from 'moment';
import realm from '../../providers/realm';

export default class EditIndividual extends React.Component {
    constructor(props) {
        super(props);
        const { params } = this.props.navigation.state;
        this.state = {
            name: params.person.Name,
            dobStatus: params.person.KnowDOB,
            Sex: params.person.Sex,
            availability: params.person.IsPersonAvailable,
            dob: params.person.DOB,
            age: params.person.Age,
            selectedDate: '',
            id: params.person.id
        }
        this.gender_option = [
            { label: 'Male', value: 'M' },
            { label: 'Female', value: 'F' }
        ]
        this.availability_option = [
            { label: 'Yes', value: true },
            { label: 'No', value: false }
        ]


    }

    static navigationOptions = {
        title: 'Edit Individual',
        headerTitleStyle: { fontSize: 23, fontWeight: 'bold' },
        headerStyle: { height: 60, borderWidth: 1, borderBottomColor: 'white', padding: 10 },
    };

    state = {
        selectedTab: 'EditIndividual'
    }
    async openDatePicker() {
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: this.state.dobStatus ? new Date(this.state.dob) : new Date(),
                maxDate: new Date()
            })
            if (action !== DatePickerAndroid.dismissedAction) {
                this.setState({ dob: `${day}-${month + 1}-${year}`, selectedDate: `${year}0${month + 1}${day}` });
            }
        } catch ({ code, message }) {
            console.log('Cannot open date picker', message);
        }
    }

    getAgeDays() {
        let now = moment();
        let end;
        if (this.state.selectedDate) {
            end = moment(this.state.selectedDate);
        }
        else {
            let dobString = String(this.state.dob).split('-');
            end = moment(dobString[2] + '0' + dobString[1] + dobString[0]);
        }
        let duration = moment.duration(now.diff(end));
        let days = duration.asDays();
        return days;
    }

    saveIndividual() {
        const { navigate } = this.props.navigation;
        const { params } = this.props.navigation.state;
        if (this.state.name && (this.state.dob || this.state.age)) {
            const householdObj = {
                id: this.state.id,
                Name: this.state.name,
                KnowDOB: this.state.dobStatus,
                DOB: this.state.dobStatus ? this.state.dob : '',
                AgeDays: this.state.dobStatus ? String(Math.floor(this.getAgeDays())) : String(Math.floor(this.state.age * 365.25)),
                Age: this.state.age,
                Sex: this.state.Sex,
                IsPersonAvailable: this.state.availability,
                Submitted: 'inprogress',
                Category: '',
                clusterID: params.clusterInfo[0].clusterID,
                AgeMonths: 0,
                UpdatedTime: moment().format('DD-MM-YYYY h:mm:ss a')
            }
            if (this.state.availability) {
                let AgeMonths = Math.floor(parseInt(householdObj['AgeDays']) / 30.4368)
                if (AgeMonths > 8 && AgeMonths < 60) {
                    householdObj['Category'] = 'A';
                }
                else if (AgeMonths > 59 && AgeMonths < 180) {
                    householdObj['Category'] = 'B';
                }
                else if (AgeMonths > 179 && AgeMonths < 600 && householdObj['Sex'] === 'F') {
                    householdObj['Category'] = 'C';
                }
                householdObj['AgeMonths'] = AgeMonths;
            }
            realm.write(() => {
                realm.create('Household', householdObj, true);
            });
            navigate('ViewCluster');


        }
        else {
            alert('Mandatory fields cannot be left empty');
        }

    }
    render() {
        const { params } = this.props.navigation.state;
        return (
            <View style={styles.container}>
                <ScrollView style={{ backgroundColor: 'white' }}>
                    <AddCardHeader
                        mainTitle={`Cluster ID : ${params.clusterInfo[0].clusterID}  / Village Name ${params.clusterInfo[0].villageName} `}
                        subTitle={`Household ID : ${params.HouseholdID}`}
                    />
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.headingLetter}>Name*</Text>
                        <FormInput
                            value={this.state.name}
                            onChangeText={(name) => this.setState({ name: name })} />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.headingLetter}>Do you know DOB ?</Text>
                        <RadioForm
                            animation={false}
                            style={{ margin: 20 }}
                            labelStyle={{ fontSize: 20, fontWeight: 'bold', marginRight: 40, color: '#4B5461' }}
                            buttonColor={'#4B5461'}
                            formHorizontal={true}
                            labelHorizontal={true}
                            radio_props={this.availability_option}
                            initial={this.state.dobStatus ? 0 : 1}
                            onPress={(value) => { this.setState({ dobStatus: value, dob: '', age: '' }); }}
                        />
                    </View>
                    {(this.state.dobStatus) &&
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.headingLetter}>Date of Birth*</Text>
                            <FormInput
                                value={this.state.dob}
                                onFocus={() => {
                                    this.openDatePicker()
                                }
                                }

                            />
                        </View>
                    }
                    {(!this.state.dobStatus) &&
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.headingLetter}>Completed Age*</Text>
                            <FormInput
                                keyboardType='numeric'
                                value={this.state.age}
                                onChangeText={(age) => this.setState({ age: age })} />
                        </View>
                    }
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.headingLetter}>Gender</Text>
                        <RadioForm
                            style={{ margin: 20 }}
                            labelStyle={{ fontSize: 20, fontWeight: 'bold', marginRight: 40, color: '#4B5461' }}
                            buttonColor={'#4B5461'}
                            formHorizontal={true}
                            labelHorizontal={true}
                            radio_props={this.gender_option}
                            initial={this.state.Sex == 'M' ? 0 : 1}
                            onPress={(value) => { this.setState({ Sex: value }); console.log(this.state) }}
                        />
                    </View>
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.headingLetter}>Availability - Will you be available for next 3-4 days during the survey ?</Text>
                        <RadioForm
                            animation={false}
                            style={{ margin: 20 }}
                            labelStyle={{ fontSize: 20, fontWeight: 'bold', marginRight: 40, color: '#4B5461' }}
                            buttonColor={'#4B5461'}
                            formHorizontal={true}
                            labelHorizontal={true}
                            radio_props={this.availability_option}
                            initial={this.state.availability ? 0 : 1}
                            onPress={(value) => { this.setState({ availability: value }); console.log(this.state) }}
                        />
                    </View>
                    <Button
                        buttonStyle={{ marginTop: 30, marginBottom: 30, backgroundColor: '#4c9689' }}
                        title='Update'
                        onPress={() => this.saveIndividual()}
                    />

                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.secondary,
        flex: 1,
    },
    headingLetter: {
        color: '#3E4A59',
        fontWeight: '700',
        fontSize: 22,
        marginLeft: 20,
        marginTop: 10,
    }
});