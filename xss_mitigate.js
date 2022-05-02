var xss = require('xss');
var options = {
    escapeHtml: function escapeHtml(html) {
        // RegEx to remove any HTML tag present in the given string.
        return html.replace(/<\/?[\w\s]*>|<(code|em|ul)(.|\n)*?>|<.+[\W]>/g, "");
    }
}
module.exports = xss;