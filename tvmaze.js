'use strict';

const missingTv = 'https://tinyurl.com/missing-tv';

const $showsList = $('#shows-list');
const $episodeList = $('#episode-list');
const $episodesArea = $('#episodes-area');
const $searchForm = $('#search-form');

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm (query) {
	// ADD: Remove placeholder & make request to TVMaze search shows API.
	const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`);

	let show = res.data.map((result) => {
		let show = result.show;
		return {
			id      : show.id,
			name    : show.name,
			summary : show.summary,
			image   : show.image ? show.image.medium : missingTv
		};
	});
	return show;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows (shows) {
	$showsList.empty();

	for (let show of shows) {
		const $show = $(
			`<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="card">
         <img class="card-img-top" src="${show.image}">
           <div class="card-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
		);

		$showsList.append($show);
	}
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

$('#search-form').on('submit', async function searchForShowAndDisplay (e) {
	e.preventDefault();
	let term = $('#search-query').val();
	let shows = await getShowsByTerm(term);
	if (!term) return;

	$episodesArea.hide();
	populateShows(shows);
});

// $searchForm.on('submit', async function (evt) {
// 	evt.preventDefault();
// 	await searchForShowAndDisplay();
// });

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow (id) {
	const res = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
	let showId = res.data.map((episode) => ({
		id     : episode.id,
		name   : episode.name,
		season : episode.season,
		number : episode.number
	}));
	return showId;
}

/** Write a clear docstring for this function... */

function populateEpisodes (episodes) {
	$episodeList.empty();
	for (let episode of episodes) {
		const $episode = $(
			`<li>
				${episode.name}(season ${episode.season}, episode ${episode.number})
			</li>`
		);
		$episodeList.append($episode);
	}
	$('#episodes-area').show();
}

$('show-list').on('click', async function buttonHandler (e) {
	let showId = $(e.target).closest('.show').data('.show-id');
	let episode = await getEpisodesOfShow(showId);
	populateEpisodes(episode);
});
