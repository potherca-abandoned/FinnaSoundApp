window.oSounds = {};

var   iItemCount
    , iTimeoutID
;

function makeColor(p_iCounter, p_iLength){
    var   iCenter = 128
        , iWidth  = 127
        , iLength = p_iLength
        , p_aFrequency = [0.3, 0.3, 0.3]
        , p_aPhase = [0, 2, 4]
    ;


    function calculate(p_i, p_iIndex){
        return Math.round(
            Math.sin(p_aFrequency[p_iIndex]*p_i + p_aPhase[p_iIndex])
            * iWidth + iCenter
        );
    }

    function calculateRGB(p_iCounter){
        return [
              calculate(p_iCounter, 0)
            , calculate(p_iCounter, 1)
            , calculate(p_iCounter, 2)
        ];
    }

    return 'rgb(' + calculateRGB(p_iCounter).join(',') + ')';

};

function loadSound(p_sSound){
    if(p_sSound !== ''){
        var oSound = new Audio('sounds/' + p_sSound + '.mp3');
        oSound.load();
        window.oSounds[p_sSound] = oSound;
    }
}

function playSound(p_sSound){
    function play(){
        window.oSounds[p_sSound].pause();
        try {
            window.oSounds[p_sSound].currentTime = 0;
        } catch(oError){
            // don't care
            //console.log(oError);
        }
        window.oSounds[p_sSound].play();
    }

    if(p_sSound === ''){
        // Nothing to do
    } else if(typeof window.oSounds[p_sSound] === 'undefined'){
        loadSound(p_sSound);
        play();
    } else {
        play();
    }

    return window.oSounds[p_sSound];

}


function displayNext(p_iCurrentButtonId, p_iDelay){
    window.setTimeout(function(){
        var $NextButton = $('.button-' + (p_iCurrentButtonId+1));
        hide($('.image-' + p_iCurrentButtonId));
        if($NextButton.length > 0){
            show($NextButton);
            enable($NextButton);
        } else {
            // End of cycle
            show($('.button-0'));
        }
    }, p_iDelay);
}

function disable(p_$Subject){
    p_$Subject.attr('disabled','disabled');
}

function enable(p_$Subject){
    p_$Subject.removeAttr('disabled');
}

function hide(p_$Subject){
    p_$Subject.removeClass('visible');
    p_$Subject.addClass('invisible');
}

function show(p_$Subject){
    p_$Subject.removeClass('invisible');
    p_$Subject.addClass('visible');
}

function loadItems(p_iIndex, p_oButton){
    var  $Button
        , $Img
        , sSound
    ;

    $Button = $('<button></button>');
    $Button.addClass('button-' + p_iIndex);
    $Button.css('background-color', makeColor(p_iIndex, iItemCount));
    $('body').append($Button);

    // Hide everything but the first button
    if(p_iIndex === 0){
        show($Button);
    } else {
        hide($Button);
        disable($Button);
    }

    $Img = $('<img class="invisible image-' + p_iIndex + '" src="images/' + p_oButton.image + '" />');
    $Button.parent().prepend($Img);

    sSound = p_oButton.sound;
    loadSound(sSound);

    $Button.on('click', function(){
        var   oSound;

        function clickTimeOutHandler(p_iDuration){
            show($Img);
            disable($Button);
            hide($Button);
            playSound(sSound);
            displayNext(parseInt(p_iIndex, 10), p_iDuration);
        }
        
        function setTimer(p_iDuration){
            if(typeof iTimeoutID !== 'undefined'){
                window.clearTimeout(iTimeoutID);
            }

            iTimeoutID = window.setTimeout(clickTimeOutHandler
                , p_iDuration
                , p_iDuration
            );
        }
        
        oSound = playSound(sSound);
        if(sSound === ''){
            setTimer(650);
        }else if(isNaN(oSound.duration)){
            $(oSound).on('loadedmetadata', function() {
                var iDuration = Math.ceil(oSound.duration * 1000);
                setTimer(iDuration);
            });
        } else {
            var iDuration = Math.ceil(oSound.duration * 1000);
            setTimer(iDuration);
        }
    });
};

$.getJSON('list.json').done(function(p_oData){
    iItemCount = p_oData.length;
    $.each(p_oData, loadItems);
});

//EOF
