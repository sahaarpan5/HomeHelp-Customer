import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';

const CachedImage = ({
    uri,
    style,
    resizeMode = 'cover',
}) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let mounted = true;

        const preload = async () => {
            if (!uri) {
                return;
            }

            try {
                await Image.prefetch(uri);

                if (mounted) {
                    setLoaded(true);
                }
            } catch (error) {
                console.log(
                    'IMAGE LOAD ERROR:',
                    uri,
                    error?.message
                );

                if (mounted) {
                    setLoaded(true);
                }
            }
        };

        preload();

        return () => {
            mounted = false;
        };
    }, [uri]);

    if (!uri) {
        return <View style={style} />;
    }

    return (
        <View style={[style, styles.container]}>

            {!loaded && (
                <View style={styles.loader}>
                    <ActivityIndicator
                        size="small"
                        color="#76577F"
                    />
                </View>
            )}

            {loaded && (
                <Image
                    source={{ uri }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode={resizeMode}
                    onError={() => setLoaded(true)}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    },

    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
});

export default CachedImage;