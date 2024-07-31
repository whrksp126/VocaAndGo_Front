let TEST_WORD_LIST = [];
const URL_PARAMS = {
  vocabulary : getValueFromURL('vocabulary'), // all, each
  test_type : getValueFromURL('test_type'), // card,
  view_types : getValueFromURL('view_types'), // word, meaning, cross, random
  word_types : getValueFromURL('word_types'), // all, confused
  problem_nums : getValueFromURL('problem_nums'), // number
  vocabulary_id : getValueFromURL('vocabulary_id'), // number
}