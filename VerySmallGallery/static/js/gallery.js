let carousel_max_move;
let carousel_point = 0;
let carousel_init_speed = 5;
let carousel_speed = carousel_init_speed;
let carousel;
let imagebox;
let scroll;
let touchX;
let scrolltimeout;

$(window).on('load', function() {
    carousel = $("#carousel")
    imagebox = $("#imagebox")
    scroll = {left: $("#scroll-left"), right: $("#scroll-right"), both: $(".scroll-button")}
    scroll.left.hide();
    carousel_max_move = carousel.width() - imagebox.width();
    console.log(carousel_max_move)

    if (carousel_max_move <= 0){
        scroll.right.hide();
        return
    }

    carousel.on('touchstart', function (e) {
        e.preventDefault();
        touchX = e.touches[0].clientX
    });

    carousel.on('touchmove', function (e) {
        e.preventDefault();
        carousel_point += touchX - e.touches[0].clientX;
        touchX = e.touches[0].clientX;
        update_carousel_position()
    });

    scroll.left.on('touchstart mousedown', function(e) {
        e.preventDefault();
        button_press(-1)
    });

    scroll.right.on('touchstart mousedown', function(e) {
        e.preventDefault();
        button_press(1)
    });

    scroll.both.on('touchleave mouseout', function() {button_up()})
    scroll.both.on('touchend mouseup', function() {button_up()})
});
function button_press(dir) {
    move_carousel(dir*carousel_speed);
    scrolltimeout = setInterval(function () {
        console.log(carousel_speed)
        move_carousel(dir*carousel_speed);
    }, 20);
}

function button_up(){
    clearInterval(scrolltimeout);
    carousel_speed = carousel_init_speed;
}
function move_carousel(speed) {
    carousel_point += speed;
    carousel_speed += 1//Math.sign(speed)
    update_carousel_position()
}

function update_carousel_position(){
    if (carousel_point <= 0) {
        scroll.left.hide();
        carousel_point = 0;
    } else if (carousel_point >= carousel_max_move) {
        carousel_point = carousel_max_move;
        scroll.right.hide();
    } else {
        scroll.both.show();
    }
    carousel.css('margin-left', '-' + carousel_point + 'px');
}