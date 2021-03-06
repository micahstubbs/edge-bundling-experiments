// Generated by CoffeeScript 1.10.0
(function() {
  var bubble_layer, h, height, line, pack, stratify, svg, vis, w, width, zoom, zoomable_layer;

  svg = d3.select('svg');

  width = svg.node().getBoundingClientRect().width;

  height = svg.node().getBoundingClientRect().height;

  zoomable_layer = svg.append('g');

  zoom = d3.zoom().scaleExtent([-Infinity, Infinity]).on('zoom', function() {
    return zoomable_layer.attrs({
      transform: d3.event.transform
    });
  });

  svg.call(zoom);

  vis = zoomable_layer.append('g').attrs({
    transform: "translate(" + (width / 2) + "," + (height / 2) + ")"
  });

  stratify = d3.stratify().parentId(function(d) {
    return d.id.substring(0, d.id.lastIndexOf("."));
  });

  w = width - 8;

  h = height - 8;

  pack = d3.pack().size([w, h]).padding(3);

  line = d3.line().curve(d3.curveBundle.beta(1)).x(function(d) {
    return d.x;
  }).y(function(d) {
    return d.y;
  });

  bubble_layer = vis.append('g').attrs({
    transform: "translate(" + (-w / 2) + "," + (-h / 2) + ")"
  });

  d3.csv('flare.csv', function(data) {
    return d3.csv('flare_links.csv', function(links_data) {
      var bubbles, enb, index, links, root;
      root = stratify(data).sum(function(d) {
        return d.value;
      }).sort(function(a, b) {
        return d3.descending(a.value, b.value);
      });
      pack(root);
      index = {};
      root.eachBefore(function(d) {
        return index[d.data.id] = d;
      });
      links_data.forEach(function(d) {
        d.source = index[d.source];
        d.target = index[d.target];
        return d.path = d.source.path(d.target);
      });
      bubbles = bubble_layer.selectAll('.bubble').data(root.descendants());
      enb = bubbles.enter().append('circle').attrs({
        "class": 'bubble',
        cx: function(d) {
          return d.x;
        },
        cy: function(d) {
          return d.y;
        },
        r: function(d) {
          return d.r;
        }
      });
      enb.append('title').text(function(d) {
        return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join(' ');
      });
      links = bubble_layer.selectAll('.link').data(links_data);
      return links.enter().append('path').attrs({
        "class": 'link',
        d: function(d) {
          return line(d.path);
        }
      });
    });
  });

}).call(this);
