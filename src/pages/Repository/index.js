import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueTypeButton } from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    state: 'open',
    issuePage: 1,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { state } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async handleIssueStateButton(state) {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 5,
      },
    });

    this.setState({
      state,
      issues: issues.data,
      issuePage: 1,
    });
  }

  async handlePaginationButton(plus) {
    const { match } = this.props;
    const { state, issuePage } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const page = plus ? issuePage + 1 : issuePage - 1;

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state,
        per_page: 5,
        page,
      },
    });

    if (page < 1 || issues.data.length < 1) {
      return;
    }

    this.setState({
      issues: issues.data,
      issuePage: page,
    });
  }

  render() {
    const { repository, issues, loading, state, issuePage } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <div className="top-issuelist">
            <div className="btn-state">
              <IssueTypeButton
                selected={state === 'open'}
                onClick={() => this.handleIssueStateButton('open')}
              >
                Open
              </IssueTypeButton>
              <IssueTypeButton
                selected={state === 'closed'}
                onClick={() => this.handleIssueStateButton('closed')}
              >
                Closed
              </IssueTypeButton>
              <IssueTypeButton
                selected={state === 'all'}
                onClick={() => this.handleIssueStateButton('all')}
              >
                All
              </IssueTypeButton>
            </div>
            <div className="pagination">
              <IssueTypeButton
                disabled={issuePage <= 1}
                onClick={() => this.handlePaginationButton(false)}
              >
                <FaArrowLeft />
              </IssueTypeButton>
              <IssueTypeButton
                onClick={() => this.handlePaginationButton(true)}
              >
                <FaArrowRight />
              </IssueTypeButton>
            </div>
          </div>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
