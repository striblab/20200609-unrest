import 'intersection-observer';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import mpls from '../sources/mpct_small.json';
import incidentsAll from '../sources/incidents_all.json';

class Map {

    constructor(target, time) {
        this.target = target;
        this.time = time;
        this.svg = d3.select(target + " svg").attr("width", 200).attr("height", $(target).outerHeight());
        this.g = this.svg.append("g");
        this.zoomed = false;
        this.scaled = $(target).width() / 520;
    }

    /********** PRIVATE METHODS **********/

    // Detect if the viewport is mobile or desktop, can be tweaked if necessary for anything in between
    _detect_mobile() {
        var winsize = $(window).width();

        if (winsize < 520) {
            return true;
        } else {
            return false;
        }
    }

    /********** PUBLIC METHODS **********/

    // Render the map
    render() {
        var self = this;

       var projection = d3.geoMercator().scale([80000]).center([-93.070335,44.930977]);

        var width = 200;
        var height = $(self.target).outerHeight();
        var centered;

        var path = d3.geoPath(projection);

       

        var svg = d3.select(self.target + " svg").attr("width", width).attr("height", height);

        // Only fire resize events in the event of a width change because it prevents
        // an awful mobile Safari bug and developer rage blackouts.
        // https://stackoverflow.com/questions/9361968/javascript-resize-event-on-scroll-mobile
        var cachedWidth = window.innerWidth;
        d3.select(window).on("resize", function() {
            var newWidth = window.innerWidth;
            if (newWidth !== cachedWidth) {
                cachedWidth = newWidth;
            }
        });
        

        self.g.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(mpls, mpls.objects.mpct).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function(d) {
                return "county C" + d.properties.id;
            })
            .attr("id", function(d) {
                return "P" + d.properties.id;
            })
            .style("stroke-width", '1')
            .style("stroke", "#ffffff")
            .style("fill", "#dddddd");

            self.g.append("g")
            .selectAll("circle")
            .data(topojson.feature(incidentsAll, incidentsAll.objects.incidents_all).features)
            .enter().append("circle")
            .filter(function(d) { return (d.properties.date == self.time); })
            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            .attr("r", 1)
            .style("fill", "#9E403C");
            
    }
}

export {
    Map as
    default
}