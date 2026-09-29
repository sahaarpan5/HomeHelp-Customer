import React, {useEffect, useState} from 'react';
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
  const [localUri, setLocalUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const downloadImage = async () => {
      if (!uri) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(false);
      setLocalUri(null);

      try {
        const success = await Image.prefetch(uri);

        if (!isMounted) {
          return;
        }

        if (success) {
          setLocalUri(uri);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (error) {
        console.log('Image download error:', error);

        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    downloadImage();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  return (
    <View style={[style, styles.imageContainer]}>

      {/* Loader */}
      {loading && !error && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="small"
            color="#76577F"
          />
        </View>
      )}

      {/* Downloaded / Cached Image */}
      {localUri && !error && (
        <Image
          source={{uri: localUri}}
          style={StyleSheet.absoluteFillObject}
          resizeMode={resizeMode}
          onLoad={() => {
            setLoading(false);
          }}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}

      {/* Error / Fallback Image */}
      {error && (
        <Image
          source={require('../asset/heroic.png')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="contain"
        />
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    overflow: 'hidden',
    position: 'relative',
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F1F7',
    zIndex: 2,
  },
});

export default CachedImage;