$(document).ready(function() {
    $("#print-consent").click(function() {
        window.print();
    });

    $("#consent").click(function() {
        go_to_page("instructions/instruct-1");
    });

    $("#no-consent").click(function() {
        allow_exit();
        self.close();
    });

    $("#instruct-1-button-next").click(function() {
        go_to_page("instructions/instruct-2");
    });
});
