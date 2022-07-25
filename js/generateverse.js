/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/

//set it all off

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/

function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}


function createVerseRef(chapter, verse) {
    var ref = chapter+'.'+(zeroPad(verse, 3));
    return ref;
}

$('#generate-random-verse').click(function (event){
    console.log(event);


    console.log('clicked');


    $.get('/js/leb/books.json').then(function(books){
        console.log('i am books in get...');
        console.log(books);
        generateRandomVerse(books);

    });

    // console.log(_.where(event, {dog: 'cat'}));


});

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/

//animate verses

/*&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&*/
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@*/
/*##########################################*/

function animateNumber(element, number, labelElement, labelText){
    $("#"+element).animateNumbers(number, false, 3000, "linear");
    $('#'+labelElement).text(labelText).show(5000);
}





function generateRandomVerse(books){

    var books = books;
    console.log('i am the books....');

    console.log(books);




    var bookUrl = 'https://www.random.org/integers/?num=1&min=1&max=66&col=1&base=10&format=plain&rnd=new';
    var chapterUrl = function(totalChapters){
        return 'https://www.random.org/integers/?num=1&min=1&max='+totalChapters+'&col=1&base=10&format=plain&rnd=new';
    };
    var verseUrl = function(totalVerses){
        return 'https://www.random.org/integers/?num=1&min=1&max='+totalVerses+'&col=1&base=10&format=plain&rnd=new';
    };
    $.get( bookUrl)
        .then(function(bookNumber){
            return $.get('/js/bible/Books.json').then(function(booksArray){
                console.log('i am the then off the booksARray');
                console.log(booksArray);

                //turn books array into actual array
                var booksArray = $.map(booksArray, function(el) { return el });
                var decrementedBookNumber = parseInt(bookNumber) - 1;
                //decrementedbooknumber is new

                var bookName = booksArray[decrementedBookNumber];

                animateNumber('book',bookNumber,'book-label',bookName);


                return bookName;

            })
        })

        .then(function(selectedBook){
            console.log('i am selectedBook');


            console.log(selectedBook);
            //remove spaces from book name
            selectedBook = selectedBook.replace(/ /g,'');

            return $.get('/js/bible/'+selectedBook+'.json').then(function(returnedBook){
                //store value of the number of total chapters of the book selected
                var totalChapters = returnedBook.chapters.length;

                if(totalChapters > 1){
                    return $.get(chapterUrl(totalChapters)).then(function(selectedChapter){
                        var randomVerse = {
                            selectedChapter: parseInt(selectedChapter),
                            returnedBook : returnedBook
                        };


                        animateNumber('chapter',randomVerse.selectedChapter,'chapter-label','Chapter '+randomVerse.selectedChapter);
                        return randomVerse
                    })
                }else{
                    var randomVerse = {
                        selectedChapter: 1,
                        returnedBook : returnedBook
                    };


                    animateNumber('chapter',randomVerse.selectedChapter,'chapter-label','Chapter '+randomVerse.selectedChapter);
                    return randomVerse
                }



            })


            //find number of chapters in specific book



            //find random chapter from book


        })



        //get the selected chapter

        .then(function(selectedBook){
            console.log('i am the selected chapter');


            console.log(selectedBook);
            console.log(selectedBook.selectedChapter);

            //get number of verses in the selected chapter
            var decrementedChapter = selectedBook.selectedChapter - 1;
            //var decrementedChapter = --selectedBook.selectedChapter;

            totalVerses = selectedBook.returnedBook.chapters[decrementedChapter].verses.length;


            return $.get(verseUrl(totalVerses)).then(function(selectedVerse){
                var randomVerse = {
                    selectedVerse: parseInt(selectedVerse),
                    selectedChapter: parseInt(selectedBook.selectedChapter),
                    selectedBook: selectedBook.returnedBook.book
                };
                animateNumber('verse',randomVerse.selectedVerse,'verse-label','Verse '+randomVerse.selectedVerse);
                return randomVerse
            })

        })


        //display the final verse

        .then(function(randomVerse){
            console.log('i am the random verse');
            console.log(randomVerse);

            return $.get('https://api.biblia.com/v1/bible/content/LEB.html?passage='+randomVerse.selectedBook.replace(/ /g,'')+randomVerse.selectedChapter+':'+randomVerse.selectedVerse+'&key=6ad09d1c46c4821f7281c15b7f6edea9').then(function(verse){
            // return $.get('/js/leb/verses.json').then(function(verse){
                console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                console.log('i am the verse from biblia');
                console.log(verse);

                // verse.forEach(function(element){
                //
                // })

                // console.log('i am the books inside the randomverse final then:');
                // console.log(books);


                // var versenumbers = createVerseRef(randomVerse.selectedChapter, randomVerse.selectedVerse);
                // console.log('i am versenumbers');
                // console.log(versenumbers);

                // var matches = _.where(verse, {verse:versenumbers});
                // var matches = _.filter(verse,function(ver){
                //     return ver
                // } {verse:versenumbers});
                //

                // var bookname;

                // _.each(matches,function(value,index){
                //     bookname = _.findWhere(books, {osis: value.book});
                // });

                // console.log('i am the bookname');
                //
                // console.log(bookname);
                // console.log('i am matches:');
                // console.log(matches);
                //





                //
                // var versetext = _.where(matches,{book: bookname});
                // console.log('yay!!!!!!i am the versetext');
                // console.log(versetext);
                //





                // _.where(verse, function(value, index){
                //     _.each(books, function(v, i){
                //         _.where(value)
                //     });
                // });


                $('#bookname').html(randomVerse.selectedBook);

                console.log(verse.replace(/(<([^>]+)>)/ig,""));

                verse = verse.replace(/(<([^>]+)>)/ig,"");

                var citation = randomVerse.selectedBook+' '+randomVerse.selectedChapter+':'+randomVerse.selectedVerse;

                $('.random-verse-text').html(verse).append('<cite>'+ citation +'</cite>');

                $('.citation').html('<cite>'+citation+'</cite>');




            })

        })

}