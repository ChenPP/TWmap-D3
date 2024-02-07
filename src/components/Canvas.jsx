import Container from '@mui/material/Container';
import {Box, Card, CardContent, ButtonGroup} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState, useCallback, useRef } from 'react';
import GoogleMapReact from 'google-map-react';
import {InputLabel, Input } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { red } from '@mui/material/colors';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import Button from '@mui/material/Button';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, HeatmapLayerF  } from '@react-google-maps/api';
import NearMeIcon from '@mui/icons-material/NearMe';
import {
  MarkerClusterer,
  SuperClusterAlgorithm
} from '@googlemaps/markerclusterer'
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';

const mapKey = 'AIzaSyCGwMCPSwDaiw9Wsvnbi8_ygSUIR5dpfoQ'
const libraries = ['places', 'visualization'];

const styles = {
  default: [],
  silver: [
    {
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#bdbdbd" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road.arterial",
      elementType: "labels.text.fill",
      stylers: [{ color: "#757575" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#dadada" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#616161" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#e5e5e5" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#eeeeee" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#c9c9c9" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9e9e9e" }],
    },
  ],
  night: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  retro: [
    { elementType: "geometry", stylers: [{ color: "#ebe3cd" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#523735" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f1e6" }] },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#c9b2a6" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "geometry.stroke",
      stylers: [{ color: "#dcd2be" }],
    },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ae9e90" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#93817c" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry.fill",
      stylers: [{ color: "#a5b076" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#447530" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#f5f1e6" }],
    },
    {
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [{ color: "#fdfcf8" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#f8c967" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#e9bc62" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry",
      stylers: [{ color: "#e98d58" }],
    },
    {
      featureType: "road.highway.controlled_access",
      elementType: "geometry.stroke",
      stylers: [{ color: "#db8555" }],
    },
    {
      featureType: "road.local",
      elementType: "labels.text.fill",
      stylers: [{ color: "#806b63" }],
    },
    {
      featureType: "transit.line",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.fill",
      stylers: [{ color: "#8f7d77" }],
    },
    {
      featureType: "transit.line",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#ebe3cd" }],
    },
    {
      featureType: "transit.station",
      elementType: "geometry",
      stylers: [{ color: "#dfd2ae" }],
    },
    {
      featureType: "water",
      elementType: "geometry.fill",
      stylers: [{ color: "#b9d3c2" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#92998d" }],
    },
  ],
  hiding: [
    {
      featureType: "poi.business",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "transit",
      elementType: "labels.icon",
      stylers: [{ visibility: "off" }],
    },
  ],
};

const containerStyle = {
  width: '800px',
  height: '550px'
};

// 橘子
const center = {
  lat: 25.0716503,
  lng: 121.5760553
};

const markers = [
  {
    id: 1,
    name: "站點一",
    position: { lat: 25.0592028, lng: 121.5700536 },
    message: '站點一自訂資訊',
  },
  {
    id: 2,
    name: "站點二",
    position: { lat: 25.0640311, lng: 121.5400201 },
    message: '站點二自訂資訊',
  },
  {
    id: 3,
    name: "站點三",
    position: { lat: 25.041735, lng: 121.5457989 },
    message: '站點三自訂資訊',
  }
];

const Canvas = () => {
  const [currentCenter, setCurrentCenter] = useState({
    lat: 25.0717717,
    lng: 121.5738798
  })

  const [positionName, setPositionName] = useState('')
  const [places, setPlaces] = useState([])

  const handleChange = async (event) => {
    console.log("👷 ~ handleChange ~ event:", event.target.value,)
    setPositionName(event.target.value)

    const position = markers.find(i => i.name === event.target.value).position
    setCurrentCenter({...position})
    map.setZoom(17)
    setActiveMarker(null)
    if (map && mk) {
      mk.clearMarkers() // 清空搜尋標記
      setPlaces([])
    }
  };
  
  const cafeSearch = async() => {
    const request = {
      location: currentCenter,
      radius: 500,
      type: ['cafe']
    };
    // 搜索附近
    // if(mapApiLoaded) { 
      // eslint-disable-next-line no-undef
      const { PlacesService } = await google.maps.importLibrary("places")
      const service = new PlacesService(map)

      service.nearbySearch(request, (results, status) => {
        if ( status === 'OK') {
          setPlaces(results) // 修改 State
          console.log('results',status, results)
          
        }
      })
      // TODO: markers
      console.log("👷 ~ Canvas ~ places:", places)
    // }
  }

  const goBackCurrent = () => {
    setCurrentCenter({
      ...center
    }) 
    map.panTo(currentCenter)
    map.setZoom(18)
    if (map && mk) {
      mk.clearMarkers() // 清空搜尋標記
      setPlaces([])
    }
  }

  const [activeMarker, setActiveMarker] = useState(null);
  // 當地圖停止托拽時為true
  const [isMapIdle, setIsMapIdle] = useState(false)
  const [map, setMap] = useState(/** @type google.maps.Map */ (null))
  const [mk, setMk] = useState(null) // 座標群
  
  // 搜尋
  const handleMapLoad = (map) => {
    console.log("👷 ~ handleMapLoad ~ map:", map)
    // mapRef.current = map
    setMap(map)
  }

  const createMarkers = (places) => {
    const markers = places?.map((item) => {
      const position = {
        lat: item.geometry.location.lat(),
        lng: item.geometry.location.lng(),
      }
      const marker = new window.google.maps.Marker({
        key: item.place_id,
        position,
        icon: {
          url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
          scaledSize: new window.google.maps.Size(30, 30),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(15, 15),
          zIndex: 1
        },
      })
      const selectedMarker = item
      const infoWindow = new window.google.maps.InfoWindow()

      marker.addListener('click', () => {
        
        infoWindow.setContent(`
          <div className="modal">
            <div className="modal-body">
              <h5 className="modal-title">${selectedMarker.name}</h5>
            </div>
          </div>
        `)
        infoWindow.open(map, marker)
      })
      return marker
    })
    return markers
  }

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const [heatmapData, setHeatmapData] = useState([])
  const [heatmapStatus, setHeatmapStatus] = useState(false)

  const setHeatMap = () => {
      const heatmapData = [
        new window.google.maps.LatLng(25.0776503, 121.5710553),
        new window.google.maps.LatLng(25.0786503, 121.5710553),
        new window.google.maps.LatLng(25.0796503, 121.5720553),
        new window.google.maps.LatLng(25.0806503, 121.5730553),
        new window.google.maps.LatLng(25.0816503, 121.5740553),
        new window.google.maps.LatLng(25.0826503, 121.5750553),
        new window.google.maps.LatLng(25.0836503, 121.5760553),
        new window.google.maps.LatLng(25.0846503, 121.5770553),
        new window.google.maps.LatLng(25.0856503, 121.5780553),
        new window.google.maps.LatLng(25.0866503, 121.5790553),
        new window.google.maps.LatLng(25.0876503, 121.5800553),

        new window.google.maps.LatLng(25.0766503, 121.5710553),
        new window.google.maps.LatLng(25.0756503, 121.5720553),
        new window.google.maps.LatLng(25.0746503, 121.5730553),
        new window.google.maps.LatLng(25.0736503, 121.5740553),
        new window.google.maps.LatLng(25.0726503, 121.5750553),
        new window.google.maps.LatLng(25.0716503, 121.5760553),
        new window.google.maps.LatLng(25.0706503, 121.5770553),
        new window.google.maps.LatLng(25.0696503, 121.5780553),
        new window.google.maps.LatLng(25.0686503, 121.5790553),
        new window.google.maps.LatLng(25.0676503, 121.5800553),
        new window.google.maps.LatLng(25.06669,   121.58210),
      ]
      setHeatmapData(heatmapData)
    console.log("👷 ~ setHeatMap ~ heatmapStatus:", heatmapStatus, heatmapData)
  }

  const setStyle = (item) => {
    console.log("👷 ~ setStyle ~ item:", item)

    // setHeatmapStatus(!heatmapStatus)
  }

  const [styleVal, setStyleVal] = useState('default')
  const [styleArr, setStyleArr] = useState('default')
  const styleValChange = (event) => {
    console.log("👷 ~ styleValChange ~ val:", event.target.value, styles[event.target.value])
    setStyleVal(event.target.value)
    setStyleArr(styles[event.target.value])
    // map.setOptions({ styles: styles[event.target.value] });
  }
  // useEffect(() => {
  //   console.log("👷 ~ useEffect ~ heatmapStatus:", heatmapStatus)
  //   setHeatmapStatus(!heatmapStatus)

  // console.log("👷 ~ Canvas ~ heatmapData:", heatmapData)
  // }, [heatmapData])

  useEffect(() => {
    console.log("👷 ~ useEffect ~ places:", places)
    if (map) {
        const markers = createMarkers(places)
        const MK = new MarkerClusterer({
          map,
          markers,
          // algorithm: new SuperClusterAlgorithm({ radius: 300 })
        })
        setMk(MK)
    }
  }, [places])

  // 使用者是否正在移動地圖
  useEffect(() => {
    if (map) {
      // 監聽地圖是否停止拖拽
      const listener = map.addListener('idle', () => {
        setIsMapIdle(true)
      })
      return () => {
        window.google.maps.event.removeListener(listener)
      }
    }
  }, [map])

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: mapKey,
    libraries,
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (
    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
      <ButtonGroup variant="outlined" aria-label="outlined button group" style={{marginBottom: '2rem'}}>
        <Button onClick={cafeSearch}><LocalCafeIcon /></Button>
        <Button onClick={goBackCurrent}><NearMeIcon /></Button>
        <Button onClick={setHeatMap}>熱視圖</Button>
        {/* <Button onClick={setStyle}>style</Button> */}
      <FormControl>
        <InputLabel id="demo-simple-select-label">樣式</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={styleVal}
          label="樣式"
          onChange={styleValChange}
        >
          <MenuItem value={'default'}>default</MenuItem>
          <MenuItem value={'silver'}>silver</MenuItem>
          <MenuItem value={'night'}>night</MenuItem>
          <MenuItem value={'retro'}>retro</MenuItem>
          <MenuItem value={'hiding'}>hiding</MenuItem>
        </Select>
      </FormControl>
      </ButtonGroup>
      {/* 自動查詢 */}
      {/* <Autocomplete>
        <Input type='text' placeholder='Origin' ref={originRef} />
      </Autocomplete> */}
      <FormControl fullWidth >
        <InputLabel id="demo-simple-select-label">站點查詢</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="站點查詢"
          value={positionName}
          onChange={handleChange}
        >
          <MenuItem value={'undefined'}></MenuItem>
          <MenuItem value={'站點一'}>站點一</MenuItem>
          <MenuItem value={'站點二'}>站點二</MenuItem>
          <MenuItem value={'站點三'}>站點三</MenuItem>
        </Select>
      </FormControl>
      <Card sx={{ maxWidth: 800 }}>
        <CardContent>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={currentCenter}
            zoom={15}
            options={{
              zoomControl: false, // 地圖縮放按鈕
              streetViewControl: false, // 小黃人
              mapTypeControl: false, // 地圖樣式 衛星\街道
              fullscreenControl: false,
              styles: styleArr,
              // styles: heatmapStatus ? [
              //   { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
              //   { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
              //   { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
              //   {
              //     featureType: "administrative.locality",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#d59563" }],
              //   },
              //   {
              //     featureType: "poi",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#d59563" }],
              //   },
              //   {
              //     featureType: "poi.park",
              //     elementType: "geometry",
              //     stylers: [{ color: "#263c3f" }],
              //   },
              //   {
              //     featureType: "poi.park",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#6b9a76" }],
              //   },
              //   {
              //     featureType: "road",
              //     elementType: "geometry",
              //     stylers: [{ color: "#38414e" }],
              //   },
              //   {
              //     featureType: "road",
              //     elementType: "geometry.stroke",
              //     stylers: [{ color: "#212a37" }],
              //   },
              //   {
              //     featureType: "road",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#9ca5b3" }],
              //   },
              //   {
              //     featureType: "road.highway",
              //     elementType: "geometry",
              //     stylers: [{ color: "#746855" }],
              //   },
              //   {
              //     featureType: "road.highway",
              //     elementType: "geometry.stroke",
              //     stylers: [{ color: "#1f2835" }],
              //   },
              //   {
              //     featureType: "road.highway",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#f3d19c" }],
              //   },
              //   {
              //     featureType: "transit",
              //     elementType: "geometry",
              //     stylers: [{ color: "#2f3948" }],
              //   },
              //   {
              //     featureType: "transit.station",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#d59563" }],
              //   },
              //   {
              //     featureType: "water",
              //     elementType: "geometry",
              //     stylers: [{ color: "#17263c" }],
              //   },
              //   {
              //     featureType: "water",
              //     elementType: "labels.text.fill",
              //     stylers: [{ color: "#515c6d" }],
              //   },
              //   {
              //     featureType: "water",
              //     elementType: "labels.text.stroke",
              //     stylers: [{ color: "#17263c" }],
              //   },
              // ] : null,
            }}
            // onLoad={handleMapLoad}
            onLoad={map => handleMapLoad(map)}
          >
             {/* <MarkerF position={currentCenter} ></MarkerF> */}
             {markers.map(({ id, position, message }) => (
                <MarkerF
                  key={id}
                  position={position}
                  onClick={() => handleActiveMarker(id)}
                >
                  {activeMarker === id ? (
                    <InfoWindowF onCloseClick={() => setActiveMarker(null)}>
                      <div>
                        <p>{message}</p>
                      </div>
                    </InfoWindowF>
                  ) : null}
                </MarkerF>
              ))}
              {
                heatmapData.length ? 
                <HeatmapLayerF data={heatmapData} getData={(item) => {
                  setStyle(item)
                }} /> : <></>
              }
          </GoogleMap>
        </CardContent>
      </Card>
      </Box>
  );
}

export default Canvas;
