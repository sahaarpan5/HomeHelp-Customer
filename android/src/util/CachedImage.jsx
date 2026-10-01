import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const CachedImage = ({
  uri,
  style,
  resizeMode = 'cover',
}) => {
  const [loading, setLoading] = useState(!!uri);
  const [error, setError] = useState(false);

  return (
    <View style={[style, styles.imageContainer]}>
      {uri && !error ? (
        <>
          {/* Loader */}
          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator
                size="small"
                color="#76577F"
              />
            </View>
          )}

          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFillObject}
            resizeMode={resizeMode}
            onLoadStart={() => {
              setLoading(true);
              setError(false);
            }}
            onLoad={() => {
              setLoading(false);
            }}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </>
      ) : (
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5EFF8',
    zIndex: 2,
  },
});

export default CachedImage;