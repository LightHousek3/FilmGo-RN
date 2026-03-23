import React from 'react';
import { View, Text } from 'react-native';
import COLORS from '../../constants/colors';
import STRINGS from '../../constants/strings';
import HashLoader from './HashLoader';

const Loading = ({ fullScreen = false, text = STRINGS.loading, size }) => {
    if (fullScreen) {
        return (
            <View
                className="flex-1 items-center justify-center"
                style={{ backgroundColor: COLORS.background }}
            >
                <HashLoader size={size || 44} color={COLORS.secondary} />
                {text && <Text className="mt-3 text-sm text-gray-400">{text}</Text>}
            </View>
        );
    }

    return (
        <View className="items-center justify-center py-8">
            <HashLoader size={size || 22} color={COLORS.secondary} />
            {text && <Text className="mt-2 text-xs text-gray-400">{text}</Text>}
        </View>
    );
};

export default React.memo(Loading);
