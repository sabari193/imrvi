import PropTypes from 'prop-types';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Text as NativeText,
} from 'react-native';
import TextElement from '../text/Text';
import fonts from '../config/fonts';
import colors from '../config/colors';
import ViewPropTypes from '../config/ViewPropTypes';
import Icon from '../icons/Icon';

const RadioButton = props => {
  const {
    component,
    checked,
    iconRight,
    title,
    center,
    right,
    containerStyle,
    textStyle,
    onPress,
    onLongPress,
    onIconPress,
    onLongIconPress,
    size,
    checkedIcon,
    uncheckedIcon,
    checkedColor,
    uncheckedColor,
    checkedTitle,
    fontFamily,
    ...attributes
  } = props;

  const Component = component || TouchableOpacity;
  let iconName = uncheckedIcon;
  if (checked) {
    iconName = checkedIcon;
  }
  return (
      <Component
          onLongPress={onLongPress}
          onPress={onPress}
          style={[styles.container, containerStyle && containerStyle]}
          {...attributes}
      >
        <View
            style={[
              styles.wrapper,
              right && { justifyContent: 'flex-end' },
              center && { justifyContent: 'center' },
            ]}
            accessible={true}
        >
          {!iconRight &&
          <Icon
              color={checked ? checkedColor : uncheckedColor}
              name={iconName}
              size={size || 35}
              onLongPress={onLongIconPress}
              onPress={onIconPress}
          />}

          {React.isValidElement(title)
              ? title
              : <TextElement
                  style={[
                    styles.text,
                    textStyle && textStyle,
                    fontFamily && { fontFamily },
                  ]}
              >
                {checked ? checkedTitle || title : title}
              </TextElement>}

          {iconRight &&
          <Icon
              color={checked ? checkedColor : uncheckedColor}
              name={iconName}
              size={size || 35}
              onLongPress={onLongIconPress}
              onPress={onIconPress}
          />}
        </View>
      </Component>
  );
};

RadioButton.defaultProps = {
  checked: false,
  iconRight: false,
  right: false,
  center: false,
  checkedColor: 'green',
  uncheckedColor: '#bfbfbf',
  checkedIcon: 'check-square-o',
  uncheckedIcon: 'square-o',
  size: 35,
};

RadioButton.propTypes = {
  component: PropTypes.any,
  checked: PropTypes.bool,
  iconRight: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  center: PropTypes.bool,
  right: PropTypes.bool,
  containerStyle: ViewPropTypes.style,
  textStyle: NativeText.propTypes.style,
  onPress: PropTypes.func,
  onLongPress: PropTypes.func,
  checkedIcon: PropTypes.string,
  uncheckedIcon: PropTypes.string,
  iconType: PropTypes.string,
  size: PropTypes.number,
  checkedColor: PropTypes.string,
  uncheckedColor: PropTypes.string,
  checkedTitle: PropTypes.string,
  onIconPress: PropTypes.func,
  onLongIconPress: PropTypes.func,
  fontFamily: PropTypes.string,
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    margin: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fafafa',
    borderColor: '#ededed',
    borderWidth: 1,
    padding: 10,
    borderRadius: 3,
  },
  text: {
    marginLeft: 10,
    marginRight: 10,
    color: '#3E4A59',
    fontWeight: 700,
    ...Platform.select({
      ios: {
        fontWeight: 'bold',
      },
      android: {
        ...fonts.android.bold,
      },
    }),
  },
});

export default RadioButton;
