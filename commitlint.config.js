module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, 
      'always', 
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']
    ],
    'scope-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 200],
    'body-max-line-length': [2, 'always', 1000],
  }
};
