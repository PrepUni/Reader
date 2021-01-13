import {
  Animated,
  AppRegistry,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Epub, Streamer} from '@ottofeller/epubjs-rn';
import React, {Component, useRef} from 'react';

class EpubReader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flow: 'paginated', // paginated || scrolled-continuous
      location: 7,
      url: 'https://s3.amazonaws.com/epubjs/books/moby-dick.epub',
      src: '',
      origin: '',
      title: '',
      toc: [],
      showBars: true,
      showNav: false,
      sliderDisabled: true,
    };
    this.epu;
    this.streamer = new Streamer();
  }

  componentDidMount() {
    this.streamer
      .start()
      .then((origin) => {
        this.setState({origin});
        return this.streamer.get(this.state.url);
      })
      .then((src) => {
        return this.setState({src});
      });

    setTimeout(() => this.toggleBars(), 1000);
  }

  componentWillUnmount() {
    this.streamer.kill();
  }

  toggleBars() {
    this.setState({showBars: !this.state.showBars});
  }

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          hidden={!this.state.showBars}
          translucent={true}
          animated={false}
        />
        <Epub
          style={styles.reader}
          ref={this.epu}
          src={this.state.src}
          flow={this.state.flow}
          location={this.state.location}
          onLocationChange={(visibleLocation) => {
            console.log('locationChanged', visibleLocation);
            this.setState({visibleLocation});
          }}
          onLocationsReady={(locations) => {
            // console.log('location total', locations.total);
            this.setState({sliderDisabled: false});
          }}
          onReady={(book) => {
            // console.log("Metadata", book.package.metadata)
            console.log('book', book);
            this.setState({
              title: book.package.metadata.title,
              toc: book.navigation.toc,
              book: book,
            });
          }}
          onPress={(cfi, position, rendition) => {
            this.toggleBars();
            console.log('press', rendition);
          }}
          onLongPress={(cfi, rendition) => {
            console.log('longpress', cfi);
          }}
          onDblPress={(cfi, position, imgSrc, rendition) => {
            // Path relative to where the book is opened
            console.log(this.state.book.path.directory);
            // imgSrc is the actual src in the img html tag
            // console.log('dblpress', cfi, position, imgSrc);
          }}
          onViewAdded={(index) => {
            console.log('added', index);
          }}
          beforeViewRemoved={(index) => {
            console.log('removed', index);
          }}
          onSelected={(cfiRange, rendition) => {
            // console.log('selected', cfiRange);
            // Add marker
            rendition.highlight(cfiRange, {});
            this.state.book.getRange(cfiRange).then(function (range) {
              console.log('selected', range);
            });
          }}
          onMarkClicked={(cfiRange, data, rendition) => {
            console.log('mark clicked', cfiRange);
            rendition.unhighlight(cfiRange);
          }}
          themes={{
            tan: {
              body: {
                // '-webkit-user-select': 'none',
                // '-moz-user-select': 'none',
                // '-ms-user-select': 'none',
                // 'user-select': 'none',
                'background-color': 'tan',
              },
            },
          }}
          theme="tan"
          regenerateLocations={true}
          generateLocations={true}
          origin={this.state.origin}
          onError={(message) => {
            console.log('EPUBJS-Webview', message);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reader: {
    flex: 1,
    alignSelf: 'stretch',
    backgroundColor: '#3F3F3C',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 55,
  },
});

export default EpubReader;
