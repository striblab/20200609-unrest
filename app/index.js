/**
 * Main JS file for project.
 */

/**
 * Define globals that are added through the js.globals in
 * the config.json file, here, mostly so linting won't get triggered
 * and its a good queue of what is available:
 */
// /* global $, _ */

/**
 * Adding dependencies
 * ---------------------------------
 * Import local ES6 or CommonJS modules like this:
 * import utilsFn from './shared/utils.js';
 *
 * Or import libraries installed with npm like this:
 * import module from 'module';
 */

// Dependencies
import utils from './shared/utils.js';

// DOM loaded
utils.documentReady(() => {
  // Mark page with note about development or staging
  utils.environmentNoting();
});




/**
 * Adding Svelte templates in the client
 * ---------------------------------
 * We can bring in the same Svelte templates that we use
 * to render the HTML into the client for interactivity.  The key
 * part is that we need to have similar data.
 *
 * First, import the template.  This is the main one, and will
 * include any other templates used in the project.
 *
 *   `import Content from '../templates/_index-content.svelte.html';`
 *
 * Get the data parts that are needed.  There are two ways to do this.
 * If you are using the buildData function to get data, then add make
 * sure the config for your data has a `local: "content.json"` property
 *
 *  1. For smaller datasets, just import them like other files.
 *     `import content from '../assets/data/content.json';`
 *  2. For larger data points, utilize window.fetch.
 *     `let content = await (await window.fetch('../assets/data/content.json')).json();`
 *
 * Once you have your data, use it like a Svelte component:
 *
 * utils.documentReady(() => {
 *   const app = new Content({
 *     target: document.querySelector('.article-lcd-body-content'),
 *     hydrate: true,
 *     data: {
 *       content
 *     }
 *   });
 * });
 */



// Common code to get svelte template loaded on the client and hack-ishly
// handle sharing
//
// import Content from '../templates/_index-content.svelte.html';
//
// utils.documentReady(() => {
//   // Deal with share place holder (remove the elements, then re-attach
//   // them in the app component)
//   const attachShare = utils.detachAndAttachElement('.share-placeholder');
//
//   // Main component
//   const app = new Content({
//     target: document.querySelector('.article-lcd-body-content'),
//     hydrate: true,
//     data: {
//       attachShare
//     }
//   });
// });

import Map from './tinymaps.js';


import mpls from '../sources/mpls.json';
import precincts from '../sources/precincts.json';
import mpct from '../sources/mpct.json';
import locations from '../sources/locations.json';
import calls311 from '../sources/calls_311.json';
import fire from '../sources/fires.json';
import police from '../sources/police.json';
import buildings from '../sources/buildings_damaged_final.json';

mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhcnRyaWJ1bmUiLCJhIjoiY2sxYjRnNjdqMGtjOTNjcGY1cHJmZDBoMiJ9.St9lE8qlWR5jIjkPYd3Wqw';

var dzoom = 5.6;

  if ($("#map").width() < 600) {
    dzoom = 5;
  }

  var mzoom = 11.5;
  var mobile_zoom = 10.5;
  var center = [-93.265015, 44.977753];

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/startribune/ck1b7427307bv1dsaq4f8aa5h',
    center: center,
    zoom: mzoom,
    minZoom: mzoom,
    maxZoom: 16
});

// map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();
// map.doubleClickZoom.disable();
map.touchZoomRotate.disableRotation();
map.dragRotate.disable();

/********** SPECIAL RESET BUTTON **********/

class CityReset {
  onAdd(map){
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl my-custom-control2 mapboxgl-ctrl-group';

    const button = this._createButton('mapboxgl-ctrl-icon monitor_button2')
    this.container.appendChild(button);
    return this.container;
  }
  onRemove(){
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
  _createButton(className) {
    const el = window.document.createElement('button')
    el.className = className;
    el.innerHTML = '<i class="far fa-building"></i>';
    el.addEventListener('click',(e)=>{
      e.style.display = 'none'
      console.log(e);
      // e.preventDefault()
      e.stopPropagation()
    },false )
    return el;
  }
}

const toggleControl2 = new CityReset();

// Setup basic map controls
map.keyboard.disable();
// map.dragPan.disable();
if (utils.isMobile()) {
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();
} else {

  map.getCanvas().style.cursor = 'pointer';
  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }),'top-right');
  map.addControl(toggleControl2,'top-right');


  $('.my-custom-control2').on('click', function(){
    map.jumpTo({
      center: center,
      zoom: mzoom,
    });
  });
}

                
map.on('load', function() {

  //NEIGHBORHOODS
    map.addSource('nb', {
        type: 'geojson',
        data: mpls
      });

        map.addLayer({
          'id': 'nb-layer',
          'interactive': true,
          'source': 'nb',
          'layout': {},
          'type': 'line',
          'paint': {
            'line-width': 1,
            'line-color': '#aaaaaa'
          }
      }, 'settlement-subdivision-label');

      map.addSource('buildings', {
        type: 'geojson',
        data: buildings
      });
     
       map.addLayer({
            'id': 'buildings-layer',
            'interactive': true,
            'source': 'buildings',
            'layout': {},
            'type': 'fill',
                 'paint': {
                'fill-antialias' : true,
                'fill-opacity': 0.85,
                'fill-outline-color': "#9E403C",
                'fill-color': "#9E403C"
          }
        }, 'road-primary');

  //PRECINCTS
      map.addSource('precincts', {
          type: 'geojson',
          data: precincts
        });
  
        map.addLayer({
          'id': 'precincts-layer',
          'interactive': true,
          'source': 'precincts',
          'layout': {},
          'type': 'circle',
           'paint': {
              'circle-opacity': 1,
              'circle-radius': 5,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#333333',
              'circle-color': '#333333'
           }
      }, 'settlement-subdivision-label');


     map.addSource('mpct', {
      type: 'geojson',
      data: mpct
    });

    map.addLayer({
          'id': 'mpct-layer',
          'interactive': true,
          'source': 'mpct',
          'layout': {},
          'type': 'line',
          'paint': {
            'line-width': 2,
            'line-color': '#333333'
          }
      });

      map.addLayer({
        'id': 'poi-labels2',
        'type': 'symbol',
        'source': 'precincts',
        'layout': {
            'text-anchor': 'center',
            'text-offset': [0, 1.4],
            'text-allow-overlap': false,
            'text-size': 14,
            'text-field': ['get', 'name'],
        },
        'paint': {
          "text-color": "#333333"
        }
     });


  //FIRES
     map.addSource('fire', {
      type: 'geojson',
      data: fire
    });
   
    map.addLayer({
      'id': 'fire-layer',
      'interactive': true,
      'source': 'fire',
      'layout': {},
      'type': 'circle',
       'paint': {
          'circle-opacity': 1,
          'circle-radius': 3,
          'circle-stroke-width': 0,
          'circle-stroke-color': '#cccccc',
          'circle-color': 'rgb(255, 127, 14)'
       }
  });

//   'circle-color': {
//     "property": "combined",
//     "stops": [
//       [0, "rgba(255, 255, 255, 0)"],
//       [43976, "#C28059"],
//       [43977, "#F2C9AC"],
//       [43978, "#DEA381"],
//       [43979, "#C28059"],
//       [43980, "#8F4B31"],
//       [43981, "#2C3942"],
//       [43982, "#556E7F"],
//       [43983, "#7F98AA"],
//       [43984, "#A8B9C5"],
//       [43985, "#C6D1D9"],
//       [43986, "#DAE1E7"]
//      ]
// }

    //311
    map.addSource('calls311', {
      type: 'geojson',
      data: calls311
    });
   
    map.addLayer({
      'id': 'calls311-layer',
      'interactive': true,
      'source': 'calls311',
      'layout': {},
      'type': 'circle',
       'paint': {
          'circle-opacity': 0.5,
          'circle-radius': 1.4,
          'circle-stroke-width': 0,
          'circle-stroke-color': '#cccccc',
          'circle-color': 'rgb(84, 193, 76)'
       }
  });

      //POLICE
      map.addSource('police', {
        type: 'geojson',
        data: police
      });
     
      map.addLayer({
        'id': 'police-layer',
        'interactive': true,
        'source': 'police',
        'layout': {},
        'type': 'circle',
        'paint': {
          'circle-opacity': 1,
          'circle-radius': 3,
          'circle-stroke-width': 0,
          'circle-stroke-color': 'rgb(107, 178, 244)',
          'circle-color': 'rgb(107, 178, 244)'
       }
      });

    //SHOTS
    map.addSource('locations', {
      type: 'geojson',
      data: locations
    });
   
    map.addLayer({
      'id': 'locations-layer',
      'interactive': true,
      'source': 'locations',
      'layout': {},
      'type': 'circle',
      'paint': {
        'circle-opacity': 1,
        'circle-radius': 2,
        'circle-stroke-width': 1.2,
        'circle-stroke-color': 'rgb(98, 123, 140)',
        'circle-color': 'rgba(0,0,0,0)'
     }
    });
  });


$(document).ready(function() {
    if ($("#map").width() < 600) {
        map.flyTo({
            center: center,
            zoom: mobile_zoom,
        });
    }
    $(window).resize(function() {
        if ($("#map").width() < 600) {
            map.flyTo({
                center: center,
                zoom: mobile_zoom,
            });
        } else {
            map.flyTo({
                center: center,
                zoom: mzoom,
            });
        }
    });
});


//SMALL MULTIPLES
const map0 = new Map("#tinymap0",43976);
const map1 = new Map("#tinymap1",43977);
const map2 = new Map("#tinymap2",43978);
const map3 = new Map("#tinymap3",43979);
const map4 = new Map("#tinymap4",43980);
const map5 = new Map("#tinymap5",43981);
const map6 = new Map("#tinymap6",43982);
const map7 = new Map("#tinymap7",43983);
const map8 = new Map("#tinymap8",43984);
const map9 = new Map("#tinymap9",43985);
const map10 = new Map("#tinymap10",43986);
const map11 = new Map("#tinymap11",43987);
const map12 = new Map("#tinymap12",43988);
const map13 = new Map("#tinymap13",43989);
const map14 = new Map("#tinymap14",43990);
const map15 = new Map("#tinymap15",43991);

map0.render();
map1.render();
map2.render();
map3.render();
map4.render();
map5.render();
map6.render();
map7.render();
map8.render();
map9.render();
map10.render();
map11.render();
map12.render();
map13.render();
map14.render();
map15.render();

!function(){"use strict";window.addEventListener("message",function(a){if(void 0!==a.data["datawrapper-height"])for(var e in a.data["datawrapper-height"]){var t=document.getElementById("datawrapper-chart-"+e)||document.querySelector("iframe[src*='"+e+"']");t&&(t.style.height=a.data["datawrapper-height"][e]+"px")}})}();