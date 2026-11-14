"use client";

import {

  useCallback,

  useEffect,

  useMemo,

  useState,

} from "react";

import Link from "next/link";

import ReactMarkdown from "react-markdown";

import {

  ArrowLeft,

  ArrowUpRight,

  BookOpen,

  Check,

  Clock3,

  Eye,

  FilePlus2,

  FileText,

  LayoutDashboard,

  LoaderCircle,

  LogOut,

  PenLine,

  RefreshCw,

  Save,

  Send,

  ShieldCheck,

  Sparkles,

  Trash2,

} from "lucide-react";

import { supabase } from "@/lib/supabase";

import styles from "./studio.module.css";

type ArticleStatus =

  | "draft"

  | "in_review"

  | "published"

  | "rejected";

type JournalRole =

  | "contributor"

  | "editor"

  | "admin";

interface JournalCategory {

  id: string;

  name: string;

  slug: string;

  description: string;

}

interface JournalArticle {

  id: string;

  author_id: string;

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  cover_image_url: string | null;

  reading_time: number;

  status: ArticleStatus;

  featured: boolean;

  published_at: string | null;

  created_at: string;

  updated_at: string;

}

interface ArticleForm {

  title: string;

  slug: string;

  excerpt: string;

  content: string;

  coverImageUrl: string;

  categoryIds: string[];

}

const EMPTY_FORM: ArticleForm = {

  title: "",

  slug: "",

  excerpt: "",

  content: "",

  coverImageUrl: "",

  categoryIds: [],

};

function createSlug(value: string) {

  return value

    .toLowerCase()

    .trim()

    .normalize("NFKD")

    .replace(/[\u0300-\u036f]/g, "")

    .replace(/[^a-z0-9\s-]/g, "")

    .replace(/\s+/g, "-")

    .replace(/-+/g, "-")

    .replace(/^-|-$/g, "");

}

function calculateReadingTime(content: string) {

  const words = content

    .trim()

    .split(/\s+/)

    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));

}

function countWords(content: string) {

  return content

    .trim()

    .split(/\s+/)

    .filter(Boolean).length;

}

function formatDate(value: string) {

  return new Intl.DateTimeFormat("en", {

    day: "numeric",

    month: "short",

    year: "numeric",

  }).format(new Date(value));

}

function statusLabel(status: ArticleStatus) {

  const labels: Record<ArticleStatus, string> = {

    draft: "Draft",

    in_review: "In review",

    published: "Published",

    rejected: "Changes requested",

  };

  return labels[status];

}

export default function StudioClient() {

  const [userId, setUserId] = useState("");

  const [userEmail, setUserEmail] = useState("");

  const [role, setRole] = useState<JournalRole>("contributor");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<

    "success" | "error" | "info"

  >("info");

  const [categories, setCategories] = useState<

    JournalCategory[]

  >([]);

  const [articles, setArticles] = useState<

    JournalArticle[]

  >([]);

  const [reviewArticles, setReviewArticles] = useState<

    JournalArticle[]

  >([]);

  const [selectedReviewArticle, setSelectedReviewArticle] =

    useState<JournalArticle | null>(null);

  const [selectedReviewCategoryIds, setSelectedReviewCategoryIds] =

    useState<string[]>([]);

  const [activeArticleId, setActiveArticleId] = useState<

    string | null

  >(null);

  const [form, setForm] = useState<ArticleForm>(EMPTY_FORM);

  const [activePanel, setActivePanel] = useState<

    "editor" | "preview"

  >("editor");

  const [activeSection, setActiveSection] = useState<

    "writing" | "drafts" | "review"

  >("writing");

  const [slugManuallyEdited, setSlugManuallyEdited] =

    useState(false);

  const isEditor =

    role === "editor" || role === "admin";

  const wordCount = useMemo(

    () => countWords(form.content),

    [form.content]

  );

  const readingTime = useMemo(

    () => calculateReadingTime(form.content),

    [form.content]

  );

  const activeArticle = articles.find(

    (article) => article.id === activeArticleId

  );

  const showMessage = useCallback(

    (

      text: string,

      type: "success" | "error" | "info" = "info"

    ) => {

      setMessage(text);

      setMessageType(type);

    },

    []

  );

  const loadCategories = useCallback(async () => {

    const { data, error } = await supabase

      .from("journal_categories")

      .select("id, name, slug, description")

      .order("name");

    if (error) {

      throw error;

    }

    setCategories((data ?? []) as JournalCategory[]);

  }, []);

  const loadArticles = useCallback(

    async (currentUserId: string, editorAccess: boolean) => {

      const { data, error } = await supabase

        .from("journal_articles")

        .select(

          "id, author_id, title, slug, excerpt, content, cover_image_url, reading_time, status, featured, published_at, created_at, updated_at"

        )

        .eq("author_id", currentUserId)

        .order("updated_at", { ascending: false });

      if (error) {

        throw error;

      }

      setArticles((data ?? []) as JournalArticle[]);

      if (editorAccess) {

        const { data: reviewData, error: reviewError } =

          await supabase

            .from("journal_articles")

            .select(

              "id, author_id, title, slug, excerpt, content, cover_image_url, reading_time, status, featured, published_at, created_at, updated_at"

            )

            .eq("status", "in_review")

            .order("updated_at", { ascending: true });

        if (reviewError) {

          throw reviewError;

        }

        setReviewArticles(

          (reviewData ?? []) as JournalArticle[]

        );

      } else {

        setReviewArticles([]);

      }

    },

    []

  );

  const loadStudio = useCallback(async () => {

    setLoading(true);

    setMessage("");

    try {

      const {

        data: { user },

        error: userError,

      } = await supabase.auth.getUser();

      if (userError) {

        throw userError;

      }

      if (!user) {

        window.location.href = `/login?next=${encodeURIComponent(

          "/blog/studio"

        )}`;

        return;

      }

      const metadataRole =

        user.app_metadata?.journal_role;

      const currentRole: JournalRole =

        metadataRole === "admin" ||

        metadataRole === "editor"

          ? metadataRole

          : "contributor";

      setUserId(user.id);

      setUserEmail(user.email ?? "");

      setRole(currentRole);

      await Promise.all([

        loadCategories(),

        loadArticles(

          user.id,

          currentRole === "admin" ||

            currentRole === "editor"

        ),

      ]);

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to load Journal Studio.",

        "error"

      );

    } finally {

      setLoading(false);

    }

  }, [loadArticles, loadCategories, showMessage]);

  useEffect(() => {

    void loadStudio();

  }, [loadStudio]);

  function updateForm<K extends keyof ArticleForm>(

    field: K,

    value: ArticleForm[K]

  ) {

    setForm((current) => ({

      ...current,

      [field]: value,

    }));

  }

  function handleTitleChange(value: string) {

    setForm((current) => ({

      ...current,

      title: value,

      slug: slugManuallyEdited

        ? current.slug

        : createSlug(value),

    }));

  }

  function handleSlugChange(value: string) {

    setSlugManuallyEdited(true);

    setForm((current) => ({

      ...current,

      slug: createSlug(value),

    }));

  }

  function toggleCategory(categoryId: string) {

    setForm((current) => ({

      ...current,

      categoryIds: current.categoryIds.includes(categoryId)

        ? current.categoryIds.filter(

            (id) => id !== categoryId

          )

        : [...current.categoryIds, categoryId],

    }));

  }

  function resetEditor() {

    setActiveArticleId(null);

    setForm(EMPTY_FORM);

    setSlugManuallyEdited(false);

    setActivePanel("editor");

    setActiveSection("writing");

    setMessage("");

  }

  async function openArticle(article: JournalArticle) {

    setLoading(true);

    setMessage("");

    try {

      const { data: categoryRows, error } = await supabase

        .from("journal_article_categories")

        .select("category_id")

        .eq("article_id", article.id);

      if (error) {

        throw error;

      }

      setActiveArticleId(article.id);

      setForm({

        title: article.title,

        slug: article.slug,

        excerpt: article.excerpt,

        content: article.content,

        coverImageUrl: article.cover_image_url ?? "",

        categoryIds: (categoryRows ?? []).map(

          (item) => item.category_id

        ),

      });

      setSlugManuallyEdited(true);

      setActiveSection("writing");

      setActivePanel("editor");

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to open this article.",

        "error"

      );

    } finally {

      setLoading(false);

    }

  }

  async function inspectReviewArticle(article: JournalArticle) {

    if (!isEditor || article.status !== "in_review") {

      showMessage(

        "This submission is not available for editorial inspection.",

        "error"

      );

      return;

    }

    setLoading(true);

    setMessage("");

    try {

      const { data: categoryRows, error } = await supabase

        .from("journal_article_categories")

        .select("category_id")

        .eq("article_id", article.id);

      if (error) throw error;

      setSelectedReviewCategoryIds(

        (categoryRows ?? []).map((item) => item.category_id)

      );

      setSelectedReviewArticle(article);

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to inspect this submission.",

        "error"

      );

    } finally {

      setLoading(false);

    }

  }

  function validateArticle() {

    if (form.title.trim().length < 5) {

      return "Your article title must contain at least 5 characters.";

    }

    if (!form.slug.trim()) {

      return "Please provide a valid article URL slug.";

    }

    if (form.excerpt.trim().length < 20) {

      return "Your excerpt must contain at least 20 characters.";

    }

    if (form.content.trim().length < 50) {

      return "Your article content must contain at least 50 characters.";

    }

    if (form.categoryIds.length === 0) {

      return "Please select at least one category.";

    }

    if (

      form.coverImageUrl.trim() &&

      !/^https?:\/\/\S+$/i.test(form.coverImageUrl.trim())

    ) {

      return "The cover image must be a valid HTTP or HTTPS URL.";

    }

    return null;

  }

  async function saveDraft(): Promise<string | null> {

    if (!userId) {

      showMessage("Your account session is unavailable.", "error");

      return null;

    }

    if (form.title.trim().length < 5) {

      showMessage(

        "Enter an article title with at least 5 characters before saving.",

        "error"

      );

      return null;

    }

    if (!form.slug.trim()) {

      showMessage("Your article needs a URL slug.", "error");

      return null;

    }

    if (

      form.coverImageUrl.trim() &&

      !/^https?:\/\/\S+$/i.test(form.coverImageUrl.trim())

    ) {

      showMessage(

        "The cover image must be a valid HTTP or HTTPS URL.",

        "error"

      );

      return null;

    }

    setSaving(true);

    setMessage("");

    try {

      const articlePayload = {

        title: form.title.trim(),

        slug: form.slug.trim(),

        excerpt: form.excerpt.trim(),

        content: form.content,

        cover_image_url:

          form.coverImageUrl.trim() || null,

        reading_time: readingTime,

      };

      let articleId = activeArticleId;

      if (articleId) {

        const { data, error } = await supabase

          .from("journal_articles")

          .update(articlePayload)

          .eq("id", articleId)

          .select("id")

          .single();

        if (error) {

          throw error;

        }

        articleId = data.id;

      } else {

        const { data, error } = await supabase

          .from("journal_articles")

          .insert({

            ...articlePayload,

            author_id: userId,

          })

          .select("id")

          .single();

        if (error) {

          throw error;

        }

        articleId = data.id;

        setActiveArticleId(articleId);

      }

      const { error: deleteError } = await supabase

        .from("journal_article_categories")

        .delete()

        .eq("article_id", articleId);

      if (deleteError) {

        throw deleteError;

      }

      if (form.categoryIds.length > 0) {

        const { error: categoryError } = await supabase

          .from("journal_article_categories")

          .insert(

            form.categoryIds.map((categoryId) => ({

              article_id: articleId,

              category_id: categoryId,

            }))

          );

        if (categoryError) {

          throw categoryError;

        }

      }

      await loadArticles(userId, isEditor);

      setSelectedReviewArticle(null);

      setSelectedReviewCategoryIds([]);

      showMessage("Your changes have been saved.", "success");

      return articleId;

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to save your draft.",

        "error"

      );

      return null;

    } finally {

      setSaving(false);

    }

  }

  async function submitForReview() {

    const validationError = validateArticle();

    if (validationError) {

      showMessage(validationError, "error");

      return;

    }

    setSubmitting(true);

    try {

      const articleId = await saveDraft();

      if (!articleId) {

        return;

      }

      const { error } = await supabase.rpc(

        "journal_submit_article",

        {

          p_article_id: articleId,

        }

      );

      if (error) {

        throw error;

      }

      await loadArticles(userId, isEditor);

      showMessage(

        "Your article has been submitted for editorial review.",

        "success"

      );

      resetEditor();

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to submit your article.",

        "error"

      );

    } finally {

      setSubmitting(false);

    }

  }

  async function reviewArticle(

    articleId: string,

    decision: "publish" | "reject"

  ) {

    if (!isEditor) {

      showMessage(

        "You do not have editorial permission.",

        "error"

      );

      return;

    }

    const confirmation =

      decision === "publish"

        ? "Publish this article to the public Journal?"

        : "Reject this submission and return it to the author?";

    if (!window.confirm(confirmation)) {

      return;

    }

    setSaving(true);

    try {

      const { error } = await supabase.rpc(

        "journal_review_article",

        {

          p_article_id: articleId,

          p_decision: decision,

        }

      );

      if (error) {

        throw error;

      }

      await loadArticles(userId, isEditor);

      setSelectedReviewArticle(null);

      setSelectedReviewCategoryIds([]);

      showMessage(

        decision === "publish"

          ? "Article published successfully."

          : "Submission rejected. The author can revise it.",

        "success"

      );

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Editorial action failed.",

        "error"

      );

    } finally {

      setSaving(false);

    }

  }

  async function unpublishArticle(articleId: string) {

    if (!isEditor) {

      return;

    }

    if (

      !window.confirm(

        "Unpublish this article? It will return to draft status."

      )

    ) {

      return;

    }

    setSaving(true);

    try {

      const { error } = await supabase.rpc(

        "journal_unpublish_article",

        {

          p_article_id: articleId,

        }

      );

      if (error) {

        throw error;

      }

      await loadArticles(userId, isEditor);

      showMessage(

        "Article unpublished successfully.",

        "success"

      );

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to unpublish this article.",

        "error"

      );

    } finally {

      setSaving(false);

    }

  }

  async function deleteDraft(articleId: string) {

    if (

      !window.confirm(

        "Delete this draft permanently? This cannot be undone."

      )

    ) {

      return;

    }

    setSaving(true);

    try {

      const { error } = await supabase

        .from("journal_articles")

        .delete()

        .eq("id", articleId);

      if (error) {

        throw error;

      }

      if (activeArticleId === articleId) {

        resetEditor();

      }

      await loadArticles(userId, isEditor);

      showMessage("Draft deleted.", "success");

    } catch (error) {

      showMessage(

        error instanceof Error

          ? error.message

          : "Unable to delete this draft.",

        "error"

      );

    } finally {

      setSaving(false);

    }

  }

  async function signOut() {

    await supabase.auth.signOut();

    window.location.href = "/login";

  }

  const myDrafts = articles.filter(

    (article) =>

      article.status === "draft" ||

      article.status === "rejected"

  );

  const mySubmissions = articles.filter(

    (article) => article.status === "in_review"

  );

  const myPublished = articles.filter(

    (article) => article.status === "published"

  );

  if (loading) {

    return (

      <main className={styles.loadingPage}>

        <LoaderCircle className={styles.spinner} size={25} />

        <p>Opening Journal Studio...</p>

      </main>

    );

  }

  if (!userId) {

    return null;

  }

  return (

    <main className={styles.page}>

      <header className={styles.topbar}>

        <Link href="/blog" className={styles.brand}>

          <span className={styles.brandMark}>H</span>

          <span>

            HACKERS<span className={styles.brandAccent}>HARBOR</span>

            <small>JOURNAL STUDIO</small>

          </span>

        </Link>

        <div className={styles.topbarRight}>

          <div className={styles.account}>

            <span className={styles.accountDot} />

            <span>{userEmail}</span>

            <span className={styles.roleLabel}>

              {role}

            </span>

          </div>

          <Link href="/blog" className={styles.backLink}>

            <ArrowLeft size={15} />

            Journal

          </Link>

          <button

            type="button"

            className={styles.iconButton}

            onClick={signOut}

            title="Sign out"

            aria-label="Sign out"

          >

            <LogOut size={17} />

          </button>

        </div>

      </header>

      <div className={styles.workspace}>

        <aside className={styles.sidebar}>

          <div className={styles.sidebarHeading}>

            WORKSPACE

          </div>

          <button

            type="button"

            className={

              activeSection === "writing"

                ? styles.sidebarActive

                : styles.sidebarButton

            }

            onClick={() => setActiveSection("writing")}

          >

            <PenLine size={17} />

            <span>Editor</span>

          </button>

          <button

            type="button"

            className={

              activeSection === "drafts"

                ? styles.sidebarActive

                : styles.sidebarButton

            }

            onClick={() => setActiveSection("drafts")}

          >

            <FileText size={17} />

            <span>My articles</span>

            <span className={styles.sidebarCount}>

              {articles.length}

            </span>

          </button>

          {isEditor && (

            <>

              <div className={styles.sidebarHeading}>

                EDITORIAL

              </div>

              <button

                type="button"

                className={

                  activeSection === "review"

                    ? styles.sidebarActive

                    : styles.sidebarButton

                }

                onClick={() => setActiveSection("review")}

              >

                <ShieldCheck size={17} />

                <span>Review queue</span>

                <span className={styles.sidebarCount}>

                  {reviewArticles.length}

                </span>

              </button>

            </>

          )}

          <div className={styles.sidebarDivider} />

          <button

            type="button"

            className={styles.newArticleButton}

            onClick={resetEditor}

          >

            <FilePlus2 size={16} />

            New article

          </button>

          <div className={styles.sidebarBottom}>

            <div className={styles.sidebarTip}>

              <Sparkles size={16} />

              <strong>Writing space</strong>

              <p>

                Good engineering writing begins with clear

                ideas and useful examples.

              </p>

            </div>

            <Link href="/blog/topics">

              <BookOpen size={15} />

              Explore topics

              <ArrowUpRight size={13} />

            </Link>

          </div>

        </aside>

        <section className={styles.mainArea}>

          <div className={styles.pageHeading}>

            <div>

              <div className={styles.breadcrumb}>

                HackersHarbor <span>/</span> Journal Studio

              </div>

              <h1>

                {activeSection === "writing"

                  ? activeArticleId

                    ? "Edit article"

                    : "Create an article"

                  : activeSection === "drafts"

                    ? "My articles"

                    : "Editorial review"}

              </h1>

              <p>

                {activeSection === "writing"

                  ? "Develop your ideas into a clear, useful article."

                  : activeSection === "drafts"

                    ? "Manage your drafts, submissions and published work."

                    : "Review submissions and manage the Journal publication queue."}

              </p>

            </div>

            {activeSection === "writing" && (

              <button

                type="button"

                className={styles.newButton}

                onClick={resetEditor}

              >

                <FilePlus2 size={16} />

                New article

              </button>

            )}

          </div>

          {message && (

            <div

              className={`${styles.message} ${

                messageType === "success"

                  ? styles.messageSuccess

                  : messageType === "error"

                    ? styles.messageError

                    : styles.messageInfo

              }`}

              role="status"

            >

              {messageType === "success" ? (

                <Check size={16} />

              ) : (

                <RefreshCw size={16} />

              )}

              <span>{message}</span>

              <button

                type="button"

                onClick={() => setMessage("")}

                aria-label="Dismiss message"

              >

                Ã—

              </button>

            </div>

          )}

          {activeSection === "writing" && (

            <>

              <div className={styles.editorToolbar}>

                <div className={styles.editorTabs}>

                  <button

                    type="button"

                    className={

                      activePanel === "editor"

                        ? styles.editorTabActive

                        : styles.editorTab

                    }

                    onClick={() => setActivePanel("editor")}

                  >

                    <PenLine size={15} />

                    Write

                  </button>

                  <button

                    type="button"

                    className={

                      activePanel === "preview"

                        ? styles.editorTabActive

                        : styles.editorTab

                    }

                    onClick={() => setActivePanel("preview")}

                  >

                    <Eye size={15} />

                    Preview

                  </button>

                </div>

                <div className={styles.editorStats}>

                  <span>{wordCount} words</span>

                  <span className={styles.statDivider} />

                  <span>

                    <Clock3 size={13} />

                    {readingTime} min read

                  </span>

                </div>

              </div>

              {activePanel === "editor" ? (

                <div className={styles.editorLayout}>

                  <div className={styles.editorMain}>

                    <div className={styles.fieldGroup}>

                      <label htmlFor="article-title">

                        Article title

                      </label>

                      <input

                        id="article-title"

                        className={styles.titleInput}

                        value={form.title}

                        onChange={(event) =>

                          handleTitleChange(event.target.value)

                        }

                        placeholder="Give your article a clear title"

                        maxLength={180}

                      />

                      <div className={styles.fieldHint}>

                        A focused title helps readers understand

                        what they'll learn.

                      </div>

                    </div>

                    <div className={styles.fieldGroup}>

                      <label htmlFor="article-slug">

                        Article URL

                      </label>

                      <div className={styles.slugInput}>

                        <span>/blog/</span>

                        <input

                          id="article-slug"

                          value={form.slug}

                          onChange={(event) =>

                            handleSlugChange(event.target.value)

                          }

                          placeholder="your-article-url"

                          maxLength={180}

                        />

                      </div>

                    </div>

                    <div className={styles.fieldGroup}>

                      <label htmlFor="article-excerpt">

                        Short description

                      </label>

                      <textarea

                        id="article-excerpt"

                        className={styles.excerptInput}

                        value={form.excerpt}

                        onChange={(event) =>

                          updateForm("excerpt", event.target.value)

                        }

                        placeholder="Explain what readers will discover in this article..."

                        rows={3}

                        maxLength={400}

                      />

                      <div className={styles.characterCount}>

                        {form.excerpt.length}/400

                      </div>

                    </div>

                    <div className={styles.fieldGroup}>

                      <label htmlFor="article-content">

                        Article content

                      </label>

                      <div className={styles.markdownHint}>

                        Markdown supported: headings, lists, links,

                        blockquotes and code blocks.

                      </div>

                      <textarea

                        id="article-content"

                        className={styles.contentInput}

                        value={form.content}

                        onChange={(event) =>

                          updateForm("content", event.target.value)

                        }

                        placeholder={`# Your article heading

Begin with an introduction that explains the problem or idea.

## First section

Explain the concept clearly.

\`\`\`python

def example():

    return "Your example"

\`\`\`

Continue with practical explanations and examples...`}

                        spellCheck

                      />

                      <div className={styles.editorFooter}>

                        <span>Markdown editor</span>

                        <span>{form.content.length} characters</span>

                      </div>

                    </div>

                  </div>

                  <aside className={styles.settingsPanel}>

                    <div className={styles.panelTitle}>

                      Article settings

                    </div>

                    <div className={styles.settingGroup}>

                      <label>Categories</label>

                      <p className={styles.settingDescription}>

                        Select at least one subject.

                      </p>

                      <div className={styles.categoryList}>

                        {categories.map((category) => (

                          <label

                            key={category.id}

                            className={styles.categoryOption}

                          >

                            <input

                              type="checkbox"

                              checked={form.categoryIds.includes(

                                category.id

                              )}

                              onChange={() =>

                                toggleCategory(category.id)

                              }

                            />

                            <span>{category.name}</span>

                          </label>

                        ))}

                      </div>

                    </div>

                    <div className={styles.settingDivider} />

                    <div className={styles.settingGroup}>

                      <label htmlFor="cover-image">

                        Cover image URL

                      </label>

                      <input

                        id="cover-image"

                        className={styles.settingInput}

                        value={form.coverImageUrl}

                        onChange={(event) =>

                          updateForm(

                            "coverImageUrl",

                            event.target.value

                          )

                        }

                        placeholder="https://..."

                      />

                      <p className={styles.settingDescription}>

                        Optional. We can add the dedicated cover

                        image workflow later.

                      </p>

                    </div>

                    <div className={styles.settingDivider} />

                    <div className={styles.readingSummary}>

                      <div>

                        <span>Word count</span>

                        <strong>{wordCount}</strong>

                      </div>

                      <div>

                        <span>Reading time</span>

                        <strong>{readingTime} min</strong>

                      </div>

                    </div>

                    <div className={styles.settingDivider} />

                    <div className={styles.statusNote}>

                      <ShieldCheck size={17} />

                      <div>

                        <strong>Editorial workflow</strong>

                        <p>

                          Articles are saved as drafts. Submit

                          them for review before publication.

                        </p>

                      </div>

                    </div>

                  </aside>

                </div>

              ) : (

                <div className={styles.previewShell}>

                  <div className={styles.previewMeta}>

                    <span>ARTICLE PREVIEW</span>

                    <span>

                      {readingTime} min read · {wordCount} words

                    </span>

                  </div>

                  <article className={styles.previewArticle}>

                    {form.categoryIds.length > 0 && (

                      <div className={styles.previewCategories}>

                        {categories

                          .filter((category) =>

                            form.categoryIds.includes(category.id)

                          )

                          .map((category) => (

                            <span key={category.id}>

                              {category.name}

                            </span>

                          ))}

                      </div>

                    )}

                    <h2>

                      {form.title || "Your article title"}

                    </h2>

                    <p className={styles.previewExcerpt}>

                      {form.excerpt ||

                        "Your article description will appear here."}

                    </p>

                    {form.coverImageUrl && (

                      <img

                        src={form.coverImageUrl}

                        alt=""

                        className={styles.previewCover}

                      />

                    )}

                    <div className={styles.markdownContent}>

                      {form.content.trim() ? (

                        <ReactMarkdown

                          components={{

                            a: ({ children, href }) => (

                              <a

                                href={href}

                                target="_blank"

                                rel="noreferrer"

                              >

                                {children}

                              </a>

                            ),

                          }}

                        >

                          {form.content}

                        </ReactMarkdown>

                      ) : (

                        <p className={styles.previewPlaceholder}>

                          Your article content will appear here

                          as you write.

                        </p>

                      )}

                    </div>

                  </article>

                </div>

              )}

              <div className={styles.actionBar}>

                <div className={styles.saveState}>

                  {activeArticle ? (

                    <>

                      <span className={styles.stateDot} />

                      Editing {statusLabel(activeArticle.status)}

                    </>

                  ) : (

                    <>

                      <span className={styles.stateDot} />

                      New article

                    </>

                  )}

                </div>

                <div className={styles.actionButtons}>

                  <button

                    type="button"

                    className={styles.secondaryButton}

                    onClick={() => void saveDraft()}

                    disabled={saving || submitting}

                  >

                    {saving ? (

                      <LoaderCircle

                        size={15}

                        className={styles.buttonSpinner}

                      />

                    ) : (

                      <Save size={15} />

                    )}

                    Save draft

                  </button>

                  <button

                    type="button"

                    className={styles.primaryButton}

                    onClick={() => void submitForReview()}

                    disabled={saving || submitting}

                  >

                    {submitting ? (

                      <LoaderCircle

                        size={15}

                        className={styles.buttonSpinner}

                      />

                    ) : (

                      <Send size={15} />

                    )}

                    Submit for review

                  </button>

                </div>

              </div>

            </>

          )}

          {activeSection === "drafts" && (

            <div className={styles.librarySection}>

              <div className={styles.libraryStats}>

                <div>

                  <strong>{myDrafts.length}</strong>

                  <span>Drafts</span>

                </div>

                <div>

                  <strong>{mySubmissions.length}</strong>

                  <span>In review</span>

                </div>

                <div>

                  <strong>{myPublished.length}</strong>

                  <span>Published</span>

                </div>

              </div>

              {articles.length === 0 ? (

                <div className={styles.emptyState}>

                  <FileText size={26} />

                  <h2>No articles yet</h2>

                  <p>

                    Your drafts and published work will appear here.

                  </p>

                  <button

                    type="button"

                    onClick={resetEditor}

                  >

                    Create your first article

                  </button>

                </div>

              ) : (

                <div className={styles.articleList}>

                  {articles.map((article) => (

                    <article

                      className={styles.articleRow}

                      key={article.id}

                    >

                      <div className={styles.articleIcon}>

                        <FileText size={19} />

                      </div>

                      <div className={styles.articleInformation}>

                        <h3>

                          {article.title || "Untitled article"}

                        </h3>

                        <p>

                          Updated {formatDate(article.updated_at)}

                          <span>·</span>

                          {article.reading_time} min read

                        </p>

                      </div>

                      <span

                        className={`${styles.statusBadge} ${

                          styles[`status_${article.status}`]

                        }`}

                      >

                        {statusLabel(article.status)}

                      </span>

                      <div className={styles.articleActions}>
  {(article.status === "draft" ||
    article.status === "rejected" ||
    article.status === "published") && (
    <button
      type="button"
      onClick={() => void openArticle(article)}
      aria-label="Edit article"
      title="Edit article"
    >
      <PenLine size={15} />
    </button>
  )}

  {(article.status === "draft" ||
    article.status === "rejected") && (
    <button
      type="button"
      onClick={() => void deleteDraft(article.id)}
      aria-label="Delete draft"
      title="Delete draft"
    >
      <Trash2 size={15} />
    </button>
  )}

  {article.status === "in_review" && (
    <span className={styles.waitingLabel}>
      Awaiting review
    </span>
  )}
</div>

                    </article>

                  ))}

                </div>

              )}

            </div>

          )}

          {activeSection === "review" && isEditor && (

            <div className={styles.reviewSection}>

              <div className={styles.reviewHeader}>

                <div>

                  <span className={styles.reviewEyebrow}>

                    EDITORIAL WORKFLOW

                  </span>

                  <h2>Submissions awaiting review</h2>

                  <p>

                    Review each article before making it public.

                  </p>

                </div>

                <span className={styles.reviewCount}>

                  {reviewArticles.length} pending

                </span>

              </div>

              {selectedReviewArticle ? (

                <div className={styles.reviewInspection}>

                  <div className={styles.reviewInspectionToolbar}>

                    <button

                      type="button"

                      className={styles.secondaryButton}

                      onClick={() => {

                        setSelectedReviewArticle(null);

                        setSelectedReviewCategoryIds([]);

                      }}

                    >

                      <ArrowLeft size={15} />

                      Back to review queue

                    </button>

                    <span className={`${styles.statusBadge} ${styles.status_in_review}`}>

                      In review

                    </span>

                  </div>

                  <article className={styles.reviewInspectionArticle}>

                    <div className={styles.reviewEyebrow}>

                      SUBMITTED {formatDate(selectedReviewArticle.updated_at)}

                    </div>

                    <h2>{selectedReviewArticle.title}</h2>

                    <div className={styles.reviewInspectionMeta}>

                      <span>Author ID: {selectedReviewArticle.author_id}</span>

                      <span>{selectedReviewArticle.reading_time} min read</span>

                      <span>{countWords(selectedReviewArticle.content)} words</span>

                    </div>

                    {selectedReviewCategoryIds.length > 0 && (

                      <div className={styles.previewCategories}>

                        {categories

                          .filter((category) =>

                            selectedReviewCategoryIds.includes(category.id)

                          )

                          .map((category) => (

                            <span key={category.id}>{category.name}</span>

                          ))}

                      </div>

                    )}

                    <p className={styles.previewExcerpt}>

                      {selectedReviewArticle.excerpt}

                    </p>

                    {selectedReviewArticle.cover_image_url && (

                      <img

                        src={selectedReviewArticle.cover_image_url}

                        alt=""

                        className={styles.previewCover}

                      />

                    )}

                    <div className={styles.markdownContent}>

                      <ReactMarkdown

                        components={{

                          a: ({ children, href }) => (

                            <a href={href} target="_blank" rel="noreferrer">

                              {children}

                            </a>

                          ),

                        }}

                      >

                        {selectedReviewArticle.content}

                      </ReactMarkdown>

                    </div>

                  </article>

                  <div className={styles.reviewInspectionActions}>

                    <button

                      type="button"

                      className={styles.rejectButton}

                      disabled={saving}

                      onClick={() =>

                        void reviewArticle(selectedReviewArticle.id, "reject")

                      }

                    >

                      Request changes

                    </button>

                    <button

                      type="button"

                      className={styles.primaryButton}

                      disabled={saving}

                      onClick={() =>

                        void reviewArticle(selectedReviewArticle.id, "publish")

                      }

                    >

                      <Check size={15} />

                      Approve &amp; publish

                    </button>

                  </div>

                </div>

              ) : reviewArticles.length === 0 ? (

                <div className={styles.emptyState}>

                  <ShieldCheck size={27} />

                  <h2>You're all caught up</h2>

                  <p>

                    New contributor submissions will appear here.

                  </p>

                </div>

              ) : (

                <div className={styles.reviewList}>

                  {reviewArticles.map((article) => (

                    <article

                      key={article.id}

                      className={styles.reviewCard}

                    >

                      <div className={styles.reviewCardHeader}>

                        <div>

                          <span className={styles.reviewEyebrow}>

                            SUBMITTED {formatDate(article.updated_at)}

                          </span>

                          <h3>{article.title}</h3>

                        </div>

                        <span

                          className={`${styles.statusBadge} ${styles.status_in_review}`}

                        >

                          In review

                        </span>

                      </div>

                      <p>{article.excerpt}</p>

                      <div className={styles.reviewDetails}>

                        <span>

                          <Clock3 size={14} />

                          {article.reading_time} min read

                        </span>

                        <span>

                          Author ID: {article.author_id.slice(0, 8)}

                        </span>

                      </div>

                      <div className={styles.reviewActions}>

                        <button

                          type="button"

                          className={styles.secondaryButton}

                          onClick={() => void inspectReviewArticle(article)}

                        >

                          <Eye size={15} />

                          Inspect article

                        </button>

                        <button

                          type="button"

                          className={styles.rejectButton}

                          disabled={saving}

                          onClick={() =>

                            void reviewArticle(

                              article.id,

                              "reject"

                            )

                          }

                        >

                          Request changes

                        </button>

                        <button

                          type="button"

                          className={styles.primaryButton}

                          disabled={saving}

                          onClick={() =>

                            void reviewArticle(

                              article.id,

                              "publish"

                            )

                          }

                        >

                          <Check size={15} />

                          Approve & publish

                        </button>

                      </div>

                    </article>

                  ))}

                </div>

              )}

            </div>

          )}

          <footer className={styles.workspaceFooter}>

            <span>HACKERSHARBOR JOURNAL</span>

            <span>Editorial workspace</span>

            <button

              type="button"

              onClick={() => void loadStudio()}

              title="Refresh workspace"

            >

              <RefreshCw size={13} />

              Refresh

            </button>

          </footer>

        </section>

      </div>

    </main>

  );

}


